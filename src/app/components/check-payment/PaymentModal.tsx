"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LuBanknote, LuQrCode } from "react-icons/lu";
import type {
  AdminPaymentResponse,
  PaymentRequest,
  TransactionDetail,
  TransactionItem,
} from "@/src/app/type/check-payment/transactions";
import type {
  PaymentMethodsResponse,
  ServiceChannelsResponse,
} from "@/src/app/type/device/payment";

type TransactionDetailResponse = {
  id: string;
  billNo: string;
  plateNo: string;
  durationDisplay: string;
  baseAmount: number;
  netAmount: number;
  paidAmount: number;
  remainingAmount: number;
  discountAmount: number;
  payment: {
    method: string | null;
    qrCodeText: string | null;
    qrCodeImageUrl: string | null;
  };
  receiptPreview?: {
    printableText: string | null;
    canPrint: boolean;
  };
};

type RawTransactionDetailResponse = TransactionDetail;

type PaymentMode = "qr" | "cash";

declare global {
  interface Window {
    Omise?: {
      setPublicKey: (publicKey: string) => void;
      createSource: (
        type: "promptpay",
        options: { amount: number; currency: "thb" },
        callback: (statusCode: number, response: { id?: string; message?: string }) => void
      ) => void;
    };
  }
}

type OmiseConfigResponse = {
  publicKey: string;
  paymentWebSocketUrl: string;
};

type OmiseChargeResponse = {
  message: string;
  charge: {
    provider: "omise";
    chargeId: string;
    status: string;
    amount: number;
    currency: "thb" | string;
    plateNo: string;
    method: "promptpay" | string;
    channel: string;
    authorizeUri?: string | null;
    authorize_uri?: string | null;
  };
};

type OmisePaymentUpdatedEvent = {
  type: "payment_updated";
  provider: "omise";
  chargeId: string;
  plateNo: string;
  paymentStatus: "successful" | "failed" | "expired" | string;
  transactionStatus: string;
  remainingAmount: number;
  exitTimeLimit: string | null;
};

type Props = {
  open: boolean;
  transactionId: string | null;
  transaction?: TransactionItem | null;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
};

function formatCurrency(value: number) {
  return value.toFixed(2);
}

const OMISE_SCRIPT_SRC = "https://cdn.omise.co/omise.js";
const OMISE_PROMPTPAY_MIN_AMOUNT = 20;

function loadOmiseScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.Omise) {
      resolve();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${OMISE_SCRIPT_SRC}"]`
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Unable to load Omise.js")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = OMISE_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Omise.js"));
    document.body.appendChild(script);
  });
}

function createPromptPaySource(amountSatang: number) {
  return new Promise<string>((resolve, reject) => {
    if (!window.Omise) {
      reject(new Error("Omise.js is not ready"));
      return;
    }

    window.Omise.createSource(
      "promptpay",
      {
        amount: amountSatang,
        currency: "thb",
      },
      (statusCode, response) => {
        if (statusCode >= 200 && statusCode < 300 && response.id) {
          resolve(response.id);
          return;
        }

        reject(new Error(response.message || "Unable to create PromptPay source"));
      }
    );
  });
}

function toSatang(amount: number) {
  return Math.round(amount * 100);
}

function buildPaymentWebSocketUrl(baseUrl: string, chargeId: string, token?: string | null) {
  const url = new URL(baseUrl);
  url.searchParams.set("chargeId", chargeId);
  url.searchParams.set("channel", "cashier");

  if (token) {
    url.searchParams.set("token", token);
  }

  return url.toString();
}

function resolveOmiseQrImage(charge?: OmiseChargeResponse["charge"] | null) {
  if (!charge?.chargeId) return null;

  return `/api/admin/payment/omise/qr?chargeId=${encodeURIComponent(charge.chargeId)}`;
}

function getBackendErrorMessage(
  response: Response,
  result: { message?: string } | null,
  fallbackMessage: string
) {
  if (result?.message) return result.message;
  if (response.status === 401) return "Unauthorized";
  if (response.status === 403) return "Forbidden";
  return fallbackMessage;
}

function resolvePaymentMode(value?: string | null): PaymentMode | null {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) return null;
  if (normalized === "cash" || normalized.includes("เงินสด")) return "cash";
  if (normalized === "qr" || normalized.includes("qr") || normalized.includes("คิวอาร์")) return "qr";

  return null;
}

function getMethodMode(method: { id: string; label: string; icon?: string; method?: string; action?: string }) {
  return (
    resolvePaymentMode(method.method) ??
    resolvePaymentMode(method.action) ??
    resolvePaymentMode(method.icon) ??
    resolvePaymentMode(method.id) ??
    resolvePaymentMode(method.label)
  );
}

function encodePathSegment(value: string) {
  return encodeURIComponent(value);
}

function getAvailablePaymentModes(
  methods: PaymentMethodsResponse | null,
  channels: ServiceChannelsResponse | null
) {
  const activeMethods = methods?.data?.filter((method) => method.isActive) ?? [];
  const activeMethodModes = new Set<PaymentMode>();
  const activeMethodKeys = new Map<string, PaymentMode>();

  if ((methods?.data?.length ?? 0) === 0) {
    return ["qr", "cash"] satisfies PaymentMode[];
  }

  activeMethods.forEach((method) => {
    const mode = getMethodMode(method);

    if (!mode) return;

    activeMethodModes.add(mode);
    [method.id, method.method, method.action, method.icon, method.label].forEach((key) => {
      if (key) activeMethodKeys.set(key.toLowerCase(), mode);
    });
  });

  const cashierChannel = (channels?.data ?? []).find(
    (item) => item.id === "cashier" || item.name.toLowerCase().includes("cashier")
  );

  if (!cashierChannel) {
    return Array.from(activeMethodModes);
  }

  const allowedModes = new Set<PaymentMode>();

  cashierChannel.allowedMethods.forEach((methodKey) => {
    const mode =
      resolvePaymentMode(methodKey) ??
      activeMethodKeys.get(methodKey.toLowerCase()) ??
      null;

    if (mode && activeMethodModes.has(mode)) {
      allowedModes.add(mode);
    }
  });

  return allowedModes.size > 0
    ? Array.from(allowedModes)
    : Array.from(activeMethodModes);
}

function sumPaidAmount(raw: RawTransactionDetailResponse) {
  return raw.payments.reduce((sum, payment) => {
    return sum + (payment.paidAmount ?? payment.amount ?? 0);
  }, 0);
}

function addUnit(date: Date, unit: "year" | "month" | "day" | "hour" | "minute") {
  const next = new Date(date);

  if (unit === "year") next.setFullYear(next.getFullYear() + 1);
  if (unit === "month") next.setMonth(next.getMonth() + 1);
  if (unit === "day") next.setDate(next.getDate() + 1);
  if (unit === "hour") next.setHours(next.getHours() + 1);
  if (unit === "minute") next.setMinutes(next.getMinutes() + 1);

  return next;
}

function countCalendarUnit(
  cursor: Date,
  end: Date,
  unit: "year" | "month" | "day" | "hour" | "minute"
) {
  let count = 0;
  let next = addUnit(cursor, unit);

  while (next <= end) {
    count += 1;
    cursor = next;
    next = addUnit(cursor, unit);
  }

  return { count, cursor };
}

function formatDurationFromMinutes(totalMinutes: number) {
  let remaining = Math.max(0, Math.floor(totalMinutes));
  const years = Math.floor(remaining / (365 * 24 * 60));
  remaining -= years * 365 * 24 * 60;
  const months = Math.floor(remaining / (30 * 24 * 60));
  remaining -= months * 30 * 24 * 60;
  const days = Math.floor(remaining / (24 * 60));
  remaining -= days * 24 * 60;
  const hours = Math.floor(remaining / 60);
  const minutes = remaining % 60;

  return formatDurationParts({ years, months, days, hours, minutes });
}

function formatDurationParts(parts: {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
}) {
  const labels = [
    parts.years ? `${parts.years} ปี` : "",
    parts.months ? `${parts.months} เดือน` : "",
    parts.days ? `${parts.days} วัน` : "",
    parts.hours ? `${parts.hours} ชั่วโมง` : "",
    parts.minutes ? `${parts.minutes} นาที` : "",
  ].filter(Boolean);

  return labels.length > 0 ? labels.join(" ") : "0 นาที";
}

function formatParkingDuration(raw: RawTransactionDetailResponse) {
  const start = raw.entryAt ? new Date(raw.entryAt) : null;
  const endSource = raw.exitAt ?? raw.calculatedAt;
  const end = endSource ? new Date(endSource) : new Date();

  if (
    !start ||
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end < start
  ) {
    return formatDurationFromMinutes(raw.totalMinutes);
  }

  let cursor = new Date(start);
  const yearsResult = countCalendarUnit(cursor, end, "year");
  cursor = yearsResult.cursor;
  const monthsResult = countCalendarUnit(cursor, end, "month");
  cursor = monthsResult.cursor;
  const daysResult = countCalendarUnit(cursor, end, "day");
  cursor = daysResult.cursor;
  const hoursResult = countCalendarUnit(cursor, end, "hour");
  cursor = hoursResult.cursor;
  const minutesResult = countCalendarUnit(cursor, end, "minute");

  return formatDurationParts({
    years: yearsResult.count,
    months: monthsResult.count,
    days: daysResult.count,
    hours: hoursResult.count,
    minutes: minutesResult.count,
  });
}

function normalizeDetail(
  raw: RawTransactionDetailResponse,
  fallbackId: string
): TransactionDetailResponse {
  const latestPayment = raw.payments.at(-1);
  const paidAmount = raw.totalPaid ?? sumPaidAmount(raw);
  const discountAmount = Math.max(raw.baseAmount - raw.netAmount, 0);

  return {
    id: raw.id ?? fallbackId,
    billNo: raw.billNo,
    plateNo: raw.plateNo,
    durationDisplay: formatParkingDuration(raw),
    baseAmount: raw.baseAmount,
    netAmount: raw.netAmount,
    paidAmount,
    remainingAmount: raw.remainingAmount,
    discountAmount,

    payment: {
      method: latestPayment?.method ?? null,
      qrCodeText: raw.qrData || null,
      qrCodeImageUrl: null,
    },

    receiptPreview: {
      printableText: null,
      canPrint: false,
    },
  };
}

function PaymentModal({
  open,
  transactionId,
  transaction,
  onClose,
  onSuccess,
}: Props) {
  const [detail, setDetail] = useState<TransactionDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<PaymentMode>("qr");
  const [printReceipt, setPrintReceipt] = useState(true);
  const [cashReceived, setCashReceived] = useState("0");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [availableMethods, setAvailableMethods] = useState<PaymentMode[]>([]);
  const [omiseCharge, setOmiseCharge] =
    useState<OmiseChargeResponse["charge"] | null>(null);
  const [qrRequested, setQrRequested] = useState(false);
  const [qrRequestKey, setQrRequestKey] = useState(0);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState("");
  const [qrImageObjectUrl, setQrImageObjectUrl] = useState("");
  const [paymentVerifyError, setPaymentVerifyError] = useState("");
  const paymentSocketRef = useRef<WebSocket | null>(null);
  const paymentFinalizedRef = useRef(false);

  function closePaymentSocket() {
    paymentSocketRef.current?.close();
    paymentSocketRef.current = null;
  }

  function handleCreatePromptPayQr() {
    closePaymentSocket();
    paymentFinalizedRef.current = false;
    setQrError("");
    setPaymentVerifyError("");
    setOmiseCharge(null);
    setQrImageObjectUrl("");
    setQrRequested(true);
    setQrRequestKey((value) => value + 1);
  }

  function handleSelectQrMode() {
    setMode("qr");

    if (!omiseCharge && !qrLoading) {
      handleCreatePromptPayQr();
    }
  }

  useEffect(() => {
    if (!open || !transactionId) return;

    let ignore = false;
    const activeTransactionId = transactionId;
    const fallbackPlateNo = transaction?.plateNo?.trim();

    async function fetchDetail() {
      try {
        setLoading(true);
        setError("");
        setQrError("");
        setPaymentVerifyError("");
        setOmiseCharge(null);
        setQrImageObjectUrl("");
        paymentFinalizedRef.current = false;
        setQrRequested(true);
        setQrRequestKey((value) => value + 1);
        setDetail(null);
        setCashReceived("0");
        closePaymentSocket();

        const token = localStorage.getItem("token");

        const settingsPromise = Promise.all([
          fetch("/api/devices/payment/methods", {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          }),
          fetch("/api/devices/payment/channels", {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          }),
        ]);

        async function fetchTransactionDetail(id: string) {
          return fetch(`/api/check-payment/transactions/${encodePathSegment(id)}`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            cache: "no-store",
          });
        }

        let lookupId = fallbackPlateNo || activeTransactionId;
        let res = await fetchTransactionDetail(lookupId);

        if (res.status === 404 && activeTransactionId !== lookupId) {
          lookupId = activeTransactionId;
          res = await fetchTransactionDetail(lookupId);
        }

        const json = (await res.json().catch(() => null)) as
          | RawTransactionDetailResponse
          | null;

        if (!res.ok || !json) {
          throw new Error(
            (json as { message?: string } | null)?.message ||
            "ไม่สามารถโหลดรายละเอียดรายการได้"
          );
        }

        const normalized = normalizeDetail(json, lookupId);
        const [methodsResponse, channelsResponse] = await settingsPromise;
        const methodsJson = (await methodsResponse.json().catch(() => null)) as PaymentMethodsResponse | null;
        const channelsJson = (await channelsResponse.json().catch(() => null)) as ServiceChannelsResponse | null;
        const allowed = getAvailablePaymentModes(methodsJson, channelsJson);

        if (!ignore) {
          setDetail(normalized);
          setAvailableMethods(allowed);
          setMode(
            allowed.includes(normalized.payment.method === "cash" ? "cash" : "qr")
              ? normalized.payment.method === "cash" ? "cash" : "qr"
              : allowed[0] ?? "qr"
          );
          setCashReceived("0");
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchDetail();

    return () => {
      ignore = true;
    };
  }, [open, transaction?.plateNo, transactionId]);

  useEffect(() => {
    if (!open || mode !== "qr" || !detail || detail.remainingAmount <= 0) return;
    if (!qrRequested || qrRequestKey === 0) return;
    if (!availableMethods.includes("qr")) return;
    if (omiseCharge || qrLoading) return;

    let cancelled = false;
    const activeDetail = detail;

    async function createOmiseCharge() {
      try {
        setQrLoading(true);
        setQrError("");

        if (activeDetail.remainingAmount < OMISE_PROMPTPAY_MIN_AMOUNT) {
          throw new Error(
            `ยอดชำระผ่าน PromptPay ต้องไม่น้อยกว่า ${formatCurrency(
              OMISE_PROMPTPAY_MIN_AMOUNT
            )} บาท กรุณาเลือกรับชำระด้วยเงินสด`
          );
        }

        const configResponse = await fetch("/api/admin/payment/omise/config", {
          method: "GET",
          cache: "no-store",
        });
        const config = (await configResponse.json().catch(() => null)) as
          | OmiseConfigResponse
          | { message?: string }
          | null;

        if (!configResponse.ok || !config || !("publicKey" in config)) {
          throw new Error(
            getBackendErrorMessage(
              configResponse,
              config as { message?: string } | null,
              "Omise public key is not configured"
            )
          );
        }

        await loadOmiseScript();

        if (!window.Omise) {
          throw new Error("Omise.js is not ready");
        }

        window.Omise.setPublicKey(config.publicKey);
        const sourceId = await createPromptPaySource(
          toSatang(activeDetail.remainingAmount)
        );

        const token = localStorage.getItem("token");
        const amountSatang = toSatang(activeDetail.remainingAmount);

        const chargeResponse = await fetch("/api/admin/payment/omise/charge", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            plateNo: activeDetail.plateNo,
            source: sourceId,
            sourceType: "promptpay",
            method: "promptpay",
            channel: "cashier",
            transactionId: activeDetail.id,
            amount: amountSatang,
          }),
          cache: "no-store",
        });

        const chargeResult = (await chargeResponse.json().catch(() => null)) as
          | OmiseChargeResponse
          | { message?: string }
          | null;

        if (
          !chargeResponse.ok ||
          !chargeResult ||
          !("charge" in chargeResult)
        ) {
          throw new Error(
            getBackendErrorMessage(
              chargeResponse,
              chargeResult as { message?: string } | null,
              "Unable to create Omise charge"
            )
          );
        }

        if (!cancelled) {
          setOmiseCharge(chargeResult.charge);
        }
      } catch (err) {
        if (!cancelled) {
          setQrError(err instanceof Error ? err.message : "Unable to create Omise QR");
        }
      } finally {
        if (!cancelled) {
          setQrLoading(false);
        }
      }
    }

    void createOmiseCharge();

    return () => {
      cancelled = true;
    };
  }, [availableMethods, detail, mode, omiseCharge, open, qrRequestKey, qrRequested]);

  useEffect(() => {
    if (!open || mode !== "qr" || !omiseCharge?.chargeId) {
      setQrImageObjectUrl("");
      return;
    }

    let cancelled = false;
    let objectUrl = "";

    async function loadQrImage() {
      try {
        const qrUrl = resolveOmiseQrImage(omiseCharge);

        if (!qrUrl) return;

        const token = localStorage.getItem("token");
        const response = await fetch(qrUrl, {
          method: "GET",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        });

        if (!response.ok) {
          const result = (await response.json().catch(() => null)) as
            | { message?: string }
            | null;

          throw new Error(result?.message || "Unable to load Omise QR image");
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);

        if (!cancelled) {
          setQrImageObjectUrl(objectUrl);
        }
      } catch (err) {
        if (!cancelled) {
          setQrError(err instanceof Error ? err.message : "Unable to load Omise QR image");
        }
      }
    }

    setQrImageObjectUrl("");
    void loadQrImage();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [mode, omiseCharge, open]);

  useEffect(() => {
    if (!open || mode !== "qr" || !omiseCharge?.chargeId) return;

    let cancelled = false;
    const activeCharge = omiseCharge;

    async function connectPaymentSocket() {
      try {
        const configResponse = await fetch("/api/admin/payment/omise/config", {
          method: "GET",
          cache: "no-store",
        });
        const config = (await configResponse.json().catch(() => null)) as
          | OmiseConfigResponse
          | null;

        if (!configResponse.ok || !config?.paymentWebSocketUrl || cancelled) {
          throw new Error("Payment WebSocket config is not available");
        }

        closePaymentSocket();
        const token = localStorage.getItem("token");
        const socket = new WebSocket(
          buildPaymentWebSocketUrl(
            config.paymentWebSocketUrl,
            activeCharge.chargeId,
            token
          )
        );
        paymentSocketRef.current = socket;

        socket.onmessage = (message) => {
          const data = JSON.parse(message.data) as OmisePaymentUpdatedEvent;

          if (data?.type !== "payment_updated") return;
          if (data.chargeId !== activeCharge.chargeId) return;

          if (data.paymentStatus === "successful") {
            if (paymentFinalizedRef.current) return;

            paymentFinalizedRef.current = true;
            closePaymentSocket();
            void Promise.resolve(onSuccess()).finally(onClose);
            return;
          }

          if (data.paymentStatus === "failed" || data.paymentStatus === "expired") {
            closePaymentSocket();
            setQrError("Omise payment failed");
          }
        };

        socket.onerror = () => {
          setPaymentVerifyError(
            "กำลังรอตรวจสอบสถานะการชำระเงิน หากชำระแล้วระบบจะปิดรายการให้อัตโนมัติ"
          );
        };
      } catch (err) {
        if (!cancelled) {
          setPaymentVerifyError(
            err instanceof Error
              ? err.message
              : "กำลังรอตรวจสอบสถานะการชำระเงิน"
          );
        }
      }
    }

    void connectPaymentSocket();

    return () => {
      cancelled = true;
      closePaymentSocket();
    };
  }, [mode, omiseCharge?.chargeId, onClose, onSuccess, open]);

  useEffect(() => {
    if (!open || mode !== "qr" || !detail || !omiseCharge?.chargeId) return;

    let cancelled = false;
    const paymentTargetId = detail.plateNo || detail.id || transactionId;

    if (!paymentTargetId) return;
    const activePaymentTargetId = paymentTargetId;

    async function pollPaymentStatus() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `/api/check-payment/transactions/${encodePathSegment(activePaymentTargetId)}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            cache: "no-store",
          }
        );

        const json = (await response.json().catch(() => null)) as
          | RawTransactionDetailResponse
          | null;

        if (!response.ok || !json || cancelled) return;

        const normalized = normalizeDetail(json, activePaymentTargetId);
        const paidByBackend =
          normalized.remainingAmount <= 0 ||
          json.status === "paid_waiting_exit" ||
          json.status === "completed";

        if (!paidByBackend || paymentFinalizedRef.current) return;

        paymentFinalizedRef.current = true;
        closePaymentSocket();
        await Promise.resolve(onSuccess());

        if (!cancelled) {
          onClose();
        }
      } catch {
        if (!cancelled) {
          setPaymentVerifyError(
            "กำลังรอตรวจสอบสถานะการชำระเงิน หากชำระแล้วระบบจะปิดรายการให้อัตโนมัติ"
          );
        }
      }
    }

    const intervalId = window.setInterval(() => {
      void pollPaymentStatus();
    }, 3000);

    void pollPaymentStatus();

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [
    detail,
    mode,
    omiseCharge?.chargeId,
    onClose,
    onSuccess,
    open,
    transactionId,
  ]);

  useEffect(() => {
    if (!open) {
      closePaymentSocket();
    }

    return () => {
      closePaymentSocket();
    };
  }, [open]);

  const receivedAmount = Number(cashReceived || 0);

  const changeAmount = useMemo(() => {
    if (!detail) return 0;
    return receivedAmount > detail.remainingAmount ? receivedAmount - detail.remainingAmount : 0;
  }, [receivedAmount, detail]);

  async function submitAdminPayment(paymentMethod: "cash" | "promptpay" | "qr") {
    if (!detail) {
      throw new Error("Missing transaction detail");
    }

    const token = localStorage.getItem("token");
    const paymentTargetId = detail.plateNo || detail.id || transactionId;

    if (!paymentTargetId) {
      throw new Error("Missing transaction id");
    }

    const payload: PaymentRequest = {
      method: paymentMethod,
      channel: "cashier",
      amount: detail.remainingAmount,
    };

    const response = await fetch(
      `/api/check-payment/transactions/${encodePathSegment(paymentTargetId)}/payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      }
    );

    const result = (await response.json().catch(() => null)) as AdminPaymentResponse | null;

    if (!response.ok) {
      throw new Error(result?.message || "ไม่สามารถยืนยันการชำระเงินได้");
    }

    return result;
  }

  async function handleConfirmPayment() {
    if (!detail) return;

    try {
      setSubmitting(true);
      setError("");

      if (!availableMethods.includes(mode)) {
        throw new Error("ช่องทางชำระเงินนี้ไม่ได้เปิดใช้งาน");
      }

      if (mode === "qr") {
        throw new Error(qrError || "รอตรวจสอบการชำระเงินจาก Omise");
      }

      if (mode === "cash" && receivedAmount < detail.remainingAmount) {
        throw new Error("จำนวนเงินรับน้อยกว่ายอดชำระ");
      }

      await submitAdminPayment("cash");

      await onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "ไม่สามารถยืนยันการชำระเงินได้"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-[#2E3445]/90 px-3 py-3 backdrop-blur-[2px] sm:px-5 sm:py-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[calc(100dvh-24px)] w-full max-w-[944px] overflow-y-auto rounded-[30px] bg-white p-3 shadow-2xl sm:rounded-[40px] sm:p-4 lg:overflow-hidden lg:p-5"
        onClick={(event) => event.stopPropagation()}
      >
        {loading ? (
          <div className="py-20 text-center text-[#64748B]">
            กำลังโหลดข้อมูล...
          </div>
        ) : error && !detail ? (
          <div className="py-20 text-center text-red-600">{error}</div>
        ) : detail ? (
          <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
            <div className="flex min-h-[460px] flex-col bg-[#F5F6F7] px-6 py-7 sm:px-8 lg:h-[560px] lg:min-h-0 lg:px-8 lg:py-8">
              <h2 className="text-[22px] font-extrabold leading-tight text-[#101C2B]">
                ทำรายการชำระเงิน
              </h2>

              <p className="mt-1 text-[13px] text-[#7A8795]">
                ตรวจสอบความถูกต้องก่อนชำระ
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between border-b border-[#E3E7EB] pb-3">
                  <span className="text-[14px] text-[#8A95A3]">เลขทะเบียน</span>
                  <span className="text-[17px] font-bold text-[#1F2933]">
                    {detail.plateNo}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 border-b border-[#E3E7EB] pb-3">
                  <span className="text-[14px] text-[#8A95A3]">เวลาที่จอด</span>
                  <span className="text-right text-[17px] font-bold text-[#1F2933]">
                    {detail.durationDisplay}
                  </span>
                </div>

                <div className="space-y-2 border-b border-[#E3E7EB] pb-4 text-[14px]">
                  <div className="flex items-center justify-between text-[#66707D]">
                    <span>ยอดรวม</span>
                    <span className="font-semibold text-[#1F2933]">
                      {formatCurrency(detail.netAmount)} ฿
                    </span>
                  </div>

                  {detail.discountAmount > 0 ? (
                    <div className="flex items-center justify-between text-[#34B44C]">
                      <span>ส่วนลด</span>
                      <span className="font-semibold">
                        -{formatCurrency(detail.discountAmount)} ฿
                      </span>
                    </div>
                  ) : null}

                  {detail.paidAmount > 0 ? (
                    <div className="flex items-center justify-between text-[#66707D]">
                      <span>ชำระแล้ว</span>
                      <span className="font-semibold text-[#1F2933]">
                        {formatCurrency(detail.paidAmount)} ฿
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="pt-3">
                  <div className="text-[14px] text-[#8A95A3]">ยอดที่ต้องชำระ</div>
                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-[38px] font-extrabold leading-none text-[#101C2B] sm:text-[42px]">
                      {formatCurrency(detail.remainingAmount)}
                    </span>
                    <span className="pb-2 text-[22px] font-bold text-[#101C2B]">
                      ฿
                    </span>
                  </div>
                </div>
              </div>

              <label className="mt-auto inline-flex cursor-pointer items-center gap-3 pt-6 text-[14px] font-semibold text-[#1F2933]">
                <input
                  type="checkbox"
                  checked={printReceipt}
                  onChange={() => setPrintReceipt((prev) => !prev)}
                  className="h-4 w-4 rounded border-[#CBD5E1]"
                />
                พิมพ์ใบเสร็จ (PrintReceipt)
              </label>
            </div>

            <div className="lg:h-[560px] lg:pr-6">
              <div className="grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={handleSelectQrMode}
                  disabled={!availableMethods.includes("qr")}
                  className={`flex min-h-[86px] cursor-pointer flex-col items-center justify-center rounded-2xl border px-4 py-3 transition disabled:cursor-not-allowed ${mode === "qr"
                      ? "border-[#8CC2FF] bg-[#EEF5FD]"
                      : "border-transparent bg-[#EFF1F3]"
                    }`}
                >
                  <div className="mb-2 flex h-12 w-28 items-center justify-center rounded-lg bg-white text-[#1D2A36]">
                    <LuQrCode size={22} />
                  </div>
                  <span className="text-[14px] font-bold text-[#1F2933]">
                    สแกนจ่าย
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("cash")}
                  disabled={!availableMethods.includes("cash")}
                  className={`flex min-h-[86px] cursor-pointer flex-col items-center justify-center rounded-2xl border px-4 py-3 transition disabled:cursor-not-allowed ${mode === "cash"
                      ? "border-[#8CC2FF] bg-[#EEF5FD]"
                      : "border-transparent bg-[#EFF1F3]"
                    }`}
                >
                  <div className="mb-2 flex h-12 w-28 items-center justify-center rounded-lg bg-white text-[#1D2A36]">
                    <LuBanknote size={22} />
                  </div>
                  <span className="text-[14px] font-bold text-[#1F2933]">
                    เงินสด
                  </span>
                </button>
              </div>

              {mode === "qr" ? (
                <div className="mt-4 text-center">
                  <div className="mx-auto flex h-[270px] w-full items-center justify-center overflow-hidden rounded-2xl border border-[#CFE2FF] bg-[#EEF5FD] px-4 py-5">
                    {qrLoading ? (
                      <div className="text-[#64748B]">
                        กำลังสร้าง QR Code จาก Omise...
                      </div>
                    ) : qrError ? (
                      <div>
                        <div className="text-red-600">{qrError}</div>
                        <button
                          type="button"
                          onClick={handleCreatePromptPayQr}
                          className="mt-4 inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full border border-[#061D36] px-5 text-[14px] font-bold text-[#061D36] transition hover:bg-white"
                        >
                          สร้าง QR ใหม่
                        </button>
                      </div>
                    ) : qrImageObjectUrl ? (
                      <div className="flex w-full flex-col items-center">
                        <img
                          src={qrImageObjectUrl}
                          alt="Omise PromptPay QR Code"
                          className="h-auto max-h-[178px] w-full max-w-[260px] object-contain lg:max-w-xs"
                        />
                        <p className="mt-4 text-[15px] text-[#374151]">
                          สแกน QR Code เพื่อชำระเงิน
                        </p>
                        {paymentVerifyError ? (
                          <p className="mt-2 text-[13px] text-[#D97706]">
                            {paymentVerifyError}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleCreatePromptPayQr}
                        disabled={!availableMethods.includes("qr") || detail.remainingAmount <= 0}
                        className="inline-flex min-h-14 cursor-pointer items-center justify-center rounded-full bg-[#061D36] px-6 text-[16px] font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        สร้าง QR PromptPay
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <label className="mb-2 block text-[14px] font-semibold text-[#66707D]">
                    จำนวนเงินที่ได้รับ
                  </label>

                  <div className="flex min-h-[72px] items-center rounded-2xl bg-[#F3F5F7] px-6">
                    <input
                      type="number"
                      min={0}
                      value={cashReceived}
                      onChange={(event) => setCashReceived(event.target.value)}
                      className="w-full cursor-text bg-transparent text-right text-[30px] font-extrabold text-[#1F2933] outline-none sm:text-[40px]"
                    />
                    <span className="ml-3 text-[22px] font-bold text-[#94A3B8]">
                      ฿
                    </span>
                  </div>

                  <div className="mt-5 rounded-[22px] bg-[#EEF3F9] px-6 py-8">
                    <div className="text-[14px] font-semibold text-[#66707D]">
                      จำนวนเงินที่ต้องทอน
                    </div>
                    <div className="mt-4 flex items-end justify-end gap-2">
                      <span className="text-[34px] font-extrabold leading-none text-[#101C2B] sm:text-[48px]">
                        {formatCurrency(changeAmount)}
                      </span>
                      <span className="pb-2 text-[22px] font-bold text-[#101C2B]">
                        ฿
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {error ? (
                <p className="mt-4 text-sm font-medium text-red-600">{error}</p>
              ) : null}

              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={submitting || detail.remainingAmount <= 0 || mode === "qr"}
                className="mt-5 inline-flex min-h-[58px] w-full cursor-pointer items-center justify-center rounded-[18px] bg-[#061D36] px-5 text-[17px] font-bold text-white shadow-[0_12px_30px_rgba(6,29,54,0.18)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 sm:text-[20px]"
              >
                {mode === "qr"
                  ? qrLoading
                    ? "กำลังสร้าง QR Code..."
                    : "รอตรวจสอบการชำระเงิน"
                  : submitting
                    ? "กำลังบันทึก..."
                    : "ยืนยันการชำระเงิน"}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="mt-4 w-full cursor-pointer text-center text-[15px] font-semibold text-[#A3AFBC]"
              >
                ยกเลิกรายการ
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default PaymentModal;
