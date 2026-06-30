"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { DateRange } from "react-day-picker";
import { LuCarFront, LuChevronDown, LuSearch } from "react-icons/lu";

import Preload from "@/src/app/components/Preload";
import TransactionsTable from "@/src/app/components/check-payment/TransactionsTable";
import PaymentModal from "@/src/app/components/check-payment/PaymentModal";
import DateRangeFilter from "@/src/app/components/summary/DateRangeFilter";

import type {
  TransactionEditDraft,
  TransactionItem,
  TransactionListResponse,
  TransactionStatus,
} from "@/src/app/type/check-payment/transactions";

const TABLE_ITEMS_PER_PAGE = 10;

type RawTransactionItem = TransactionListResponse["data"][number];

type TransactionListApiResponse = TransactionListResponse;

function getErrorMessage(value: unknown, fallback: string) {
  if (
    value &&
    typeof value === "object" &&
    "message" in value &&
    typeof value.message === "string"
  ) {
    return value.message;
  }

  return fallback;
}

function isTransactionListApiResponse(
  value: unknown
): value is TransactionListApiResponse {
  if (!value || typeof value !== "object") return false;

  return "data" in value || "meta" in value;
}

function normalizeDateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isDateInRange(value: string | null | undefined, range?: DateRange) {
  if (!range?.from) return true;
  if (!value) return false;

  const targetDate = new Date(value);

  if (Number.isNaN(targetDate.getTime())) {
    return false;
  }

  const target = normalizeDateOnly(targetDate).getTime();
  const from = normalizeDateOnly(range.from).getTime();
  const to = normalizeDateOnly(range.to ?? range.from).getTime();

  return target >= from && target <= to;
}

function getDateTimeValue(value: string | null | undefined) {
  if (!value) return 0;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function getLastPayment(item: RawTransactionItem) {
  return item.latestPayment;
}

function normalizeTransaction(item: RawTransactionItem): TransactionItem {
  const lastPayment = getLastPayment(item);

  return {
    id: item.id,
    billNo: item.billNo,
    plateNo: item.plateNo,
    vehicleType: item.vehicleType,
    entryAt: item.entryAt,
    exitAt: item.exitAt,
    netAmount: item.amount.net,
    status: item.status,
    payment: {
      method: lastPayment?.method ?? null,
      paidAt: lastPayment?.paidAt ?? null,
    },
  };
}

type StatusFilter = "all" | TransactionStatus;

function CheckPaymentPage() {
  const [searchPlate, setSearchPlate] = useState("");
  const [debouncedSearchPlate, setDebouncedSearchPlate] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const [status, setStatus] = useState<StatusFilter>("all");
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [isRealtime, setIsRealtime] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingEditId, setSavingEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TransactionEditDraft | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionItem | null>(null);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);

  const loadingTimerRef = useRef<number | null>(null);

  const filteredItems = useMemo(() => {
    const keyword = debouncedSearchPlate.trim().toLowerCase();

    return items
      .filter((item) => {
        const plateNo = item.plateNo ?? "";
        const billNo = item.billNo ?? "";
        const matchKeyword = keyword
          ? plateNo.toLowerCase().includes(keyword) ||
          billNo.toLowerCase().includes(keyword)
          : true;

        const matchStatus = status === "all" ? true : item.status === status;
        const matchDate = isDateInRange(item.entryAt, dateRange);

        return matchKeyword && matchStatus && matchDate;
      })
      .sort((a, b) => {
        const latestA = Math.max(
          getDateTimeValue(a.entryAt),
          getDateTimeValue(a.payment.paidAt)
        );
        const latestB = Math.max(
          getDateTimeValue(b.entryAt),
          getDateTimeValue(b.payment.paidAt)
        );

        return latestB - latestA;
      });
  }, [items, debouncedSearchPlate, status, dateRange]);

  const filteredTotal = filteredItems.length;

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredTotal / TABLE_ITEMS_PER_PAGE));
  }, [filteredTotal]);

  const pagedItems = useMemo(() => {
    const start = (page - 1) * TABLE_ITEMS_PER_PAGE;
    const end = start + TABLE_ITEMS_PER_PAGE;

    return filteredItems.slice(start, end);
  }, [filteredItems, page]);

  const pageNumbers = useMemo(() => {
    const maxVisiblePages = 5;
    const startPage = Math.max(
      1,
      Math.min(page - 2, totalPages - maxVisiblePages + 1)
    );
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, index) => startPage + index
    );
  }, [page, totalPages]);

  const firstItemNumber =
    filteredTotal === 0 ? 0 : (page - 1) * TABLE_ITEMS_PER_PAGE + 1;

  const lastItemNumber = Math.min(
    page * TABLE_ITEMS_PER_PAGE,
    filteredTotal
  );

  function finishLoadingAfterDelay() {
    if (loadingTimerRef.current) {
      window.clearTimeout(loadingTimerRef.current);
    }

    loadingTimerRef.current = window.setTimeout(() => {
      setLoading(false);
      setProgress(0);
      loadingTimerRef.current = null;
    }, 350);
  }

  async function fetchTransactions(showLoading = false): Promise<void> {
    try {
      if (showLoading) {
        setLoading(true);
        setProgress(8);
      }

      setError("");

      const token = localStorage.getItem("token");

      if (showLoading) {
        setProgress(18);
      }

      const response = await fetch("/api/check-payment/transactions?all=true", {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      });

      if (showLoading) {
        setProgress(60);
      }

      const raw = (await response.json().catch(() => null)) as TransactionListApiResponse | null;

      if (showLoading) {
        setProgress(82);
      }

      if (!response.ok) {
        throw new Error(getErrorMessage(raw, "ไม่สามารถโหลดข้อมูลได้"));
      }

      if (!isTransactionListApiResponse(raw)) {
        throw new Error("รูปแบบข้อมูลรายการไม่ถูกต้อง");
      }

      const normalizedItems = (raw.data ?? []).map(normalizeTransaction);

      setItems(normalizedItems);
      if (showLoading) {
        setProgress(100);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      if (showLoading) {
        setProgress(100);
      }
    } finally {
      if (showLoading) {
        finishLoadingAfterDelay();
      }
    }
  }

  useEffect(() => {
    void fetchTransactions(true);

    return () => {
      if (loadingTimerRef.current) {
        window.clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let reconnectTimer: number | undefined;
    let pollingTimer: number | undefined;
    let refetchTimer: number | undefined;
    let eventsUnsupported = false;

    function scheduleRefetch() {
      if (refetchTimer) {
        window.clearTimeout(refetchTimer);
      }

      refetchTimer = window.setTimeout(() => {
        void fetchTransactions(false);
      }, 300);
    }

    async function pollTransactions() {
      try {
        await fetchTransactions(false);
      } catch {
        // The next polling interval retries automatically.
      }
    }

    function startPolling() {
      setIsRealtime(false);

      if (pollingTimer) return;

      void pollTransactions();
      pollingTimer = window.setInterval(pollTransactions, 30000);
    }

    async function connect() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/check-payment/transactions/events", {
          headers: {
            Accept: "text/event-stream",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
        });

        if (response.status === 404 || response.status === 501) {
          eventsUnsupported = true;
          startPolling();
          return;
        }

        if (!response.ok || !response.body) {
          throw new Error("SSE unavailable");
        }

        setIsRealtime(true);

        if (pollingTimer) {
          window.clearInterval(pollingTimer);
          pollingTimer = undefined;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (!controller.signal.aborted) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split(/\r?\n\r?\n/);
          buffer = chunks.pop() ?? "";

          for (const chunk of chunks) {
            const dataText = chunk
              .split(/\r?\n/)
              .filter((line) => line.startsWith("data:"))
              .map((line) => line.slice(5).trim())
              .join("\n");

            if (!dataText) continue;

            const event = JSON.parse(dataText) as { type?: string };
            if (event.type === "connected" || event.type === "ping") continue;

            scheduleRefetch();
          }
        }

        if (!controller.signal.aborted) {
          throw new Error("SSE disconnected");
        }
      } catch {
        if (controller.signal.aborted) return;

        startPolling();

        if (!eventsUnsupported) {
          reconnectTimer = window.setTimeout(connect, 5000);
        }
      }
    }

    void connect();

    return () => {
      controller.abort();

      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      if (pollingTimer) window.clearInterval(pollingTimer);
      if (refetchTimer) window.clearTimeout(refetchTimer);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchPlate(searchPlate.trim());
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchPlate]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchPlate, status, dateRange]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  function handleChangeStatus(nextStatus: StatusFilter) {
    setStatus(nextStatus);
  }

  function handleChangeDateRange(nextRange: DateRange | undefined) {
    setDateRange(nextRange);
  }

  function handleStartEdit(item: TransactionItem) {
    setEditingId(item.id);
    setDraft({
      plateNo: item.plateNo,
    });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setDraft(null);
  }

  function handleChangeDraft(field: keyof TransactionEditDraft, value: string) {
    setDraft((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        [field]: value,
      };
    });
  }

  async function handleSaveEdit(id: string) {
    const nextPlateNo = draft?.plateNo?.trim();

    if (!nextPlateNo) {
      setError("กรุณากรอกเลขทะเบียน");
      return;
    }

    try {
      setSavingEditId(id);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `/api/check-payment/transactions/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            plateNo: nextPlateNo,
          }),
        }
      );

      const raw: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getErrorMessage(raw, "ไม่สามารถแก้ไขเลขทะเบียนได้"));
      }

      handleCancelEdit();
      await fetchTransactions(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSavingEditId(null);
    }
  }

  function handleOpenPayment(id: string) {
    setSelectedTransaction(items.find((item) => item.id === id) ?? null);
    setSelectedId(id);
    setOpenPaymentModal(true);
  }

  function handleClosePayment() {
    setOpenPaymentModal(false);
    setSelectedId(null);
    setSelectedTransaction(null);
  }

  if (loading) {
    return (
      <Preload
        open
        progress={progress}
        message="กำลังโหลดข้อมูล..."
        detail="ตรวจสอบและชำระเงิน"
        fullscreen={false}
      />
    );
  }

  return (
    <>
      <section className="min-h-screen bg-[#EFEFEF] px-4 py-6 text-[#1F2933] md:px-8 md:py-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-[28px] font-extrabold leading-none text-[#2B3640] sm:text-[34px]">
                ตรวจสอบและชำระเงิน
              </h1>
              <p className="mt-3 text-[15px] text-[#67727E]">• แอดมินบริการ</p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#49C85B] bg-[#F5FFF6] px-4 py-2 text-[13px] font-semibold text-[#38B449]">
              <span className="h-2 w-2 rounded-full bg-[#38B449]" />
              <span>{isRealtime ? "Realtime" : "Online"}</span>
            </div>
          </div>

          <div className="rounded-[20px] border border-[#D8DADF] bg-[#F2F2F2] p-4 shadow-sm sm:p-6">
            <div className="text-center text-[18px] font-extrabold text-[#111827] sm:text-[20px]">
              ค้นหาด้วยเลขทะเบียน
            </div>

            <div className="mt-5 grid min-w-0 max-w-full gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="relative flex h-12 items-center rounded-full border border-gray-300 bg-[#F4F4F4] px-4 sm:px-6">
                <LuCarFront size={22} className="shrink-0 text-[#8D99A8]" />

                <input
                  value={searchPlate}
                  onChange={(event) => setSearchPlate(event.target.value)}
                  placeholder="กรอกเลขทะเบียน"
                  className="ml-3 min-w-0 w-full bg-transparent pr-9 text-[16px] text-[#1F2933] outline-none placeholder:text-[#9AA3AF] sm:ml-4 sm:pr-10"
                />

                <LuSearch
                  size={20}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8D99A8] sm:right-6"
                />
              </div>

              <DateRangeFilter
                value={dateRange}
                onChange={handleChangeDateRange}
              />
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-[20px] border border-[#BAC0C8] bg-white shadow-sm">
            <div className="bg-[#031C36] px-6 py-5 text-white">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-[18px] font-extrabold">ผลการค้นหา</h2>
                  <span className="text-[13px] text-white/80">
                    แสดง {firstItemNumber}-{lastItemNumber} จากทั้งหมด{" "}
                    {filteredTotal} รายการ
                  </span>
                </div>

                <div className="relative">
                  <select
                    value={status}
                    onChange={(event) =>
                      handleChangeStatus(
                        event.target.value as StatusFilter
                      )
                    }
                    className="appearance-none rounded-full bg-white px-5 py-2 pr-10 text-[14px] font-semibold text-[#1F2933] outline-none"
                  >
                    <option value="all">สถานะทั้งหมด</option>
                    <option value="pending">ยังไม่จ่าย</option>
                    <option value="partially_paid">จ่ายบางส่วน</option>
                    <option value="paid_waiting_exit">จ่ายครบ รอรถออก</option>
                    <option value="completed">รถออกแล้ว</option>
                    <option value="cancelled">ยกเลิก</option>
                  </select>

                  <LuChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#1F2933]"
                  />
                </div>
              </div>
            </div>

            {error ? (
              <div className="px-6 py-10 text-[15px] text-red-600">{error}</div>
            ) : (
              <TransactionsTable
                items={pagedItems}
                editingId={editingId}
                savingEditId={savingEditId}
                draft={draft}
                onChangeDraft={handleChangeDraft}
                onPay={handleOpenPayment}
                onStartEdit={handleStartEdit}
                onCancelEdit={handleCancelEdit}
                onSaveEdit={handleSaveEdit}
              />
            )}
          </div>

          <div className="mt-5 flex flex-col gap-4 rounded-[20px] border border-[#D8DADF] bg-white px-5 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="text-sm font-medium text-[#6B7280]">
              ทั้งหมด {filteredTotal} รายการ
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="h-10 rounded-full border border-[#D8DADF] bg-white px-4 text-sm font-semibold text-[#1F2933] transition hover:bg-[#F4F4F4] disabled:cursor-not-allowed disabled:opacity-50"
              >
                ก่อนหน้า
              </button>

              {page > 3 ? (
                <>
                  <button
                    type="button"
                    onClick={() => setPage(1)}
                    className="h-10 min-w-10 rounded-full border border-[#D8DADF] bg-white px-4 text-sm font-semibold text-[#1F2933] transition hover:bg-[#F4F4F4]"
                  >
                    1
                  </button>
                  <span className="px-1 text-sm text-[#6B7280]">...</span>
                </>
              ) : null}

              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={`h-10 min-w-10 rounded-full px-4 text-sm font-semibold transition ${page === pageNumber
                      ? "bg-[#061D36] text-white"
                      : "border border-[#D8DADF] bg-white text-[#1F2933] hover:bg-[#F4F4F4]"
                    }`}
                >
                  {pageNumber}
                </button>
              ))}

              {page < totalPages - 2 ? (
                <>
                  <span className="px-1 text-sm text-[#6B7280]">...</span>
                  <button
                    type="button"
                    onClick={() => setPage(totalPages)}
                    className="h-10 min-w-10 rounded-full border border-[#D8DADF] bg-white px-4 text-sm font-semibold text-[#1F2933] transition hover:bg-[#F4F4F4]"
                  >
                    {totalPages}
                  </button>
                </>
              ) : null}

              <button
                type="button"
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={page === totalPages}
                className="h-10 rounded-full border border-[#D8DADF] bg-white px-4 text-sm font-semibold text-[#1F2933] transition hover:bg-[#F4F4F4] disabled:cursor-not-allowed disabled:opacity-50"
              >
                ถัดไป
              </button>
            </div>
          </div>
        </div>
      </section>

      <PaymentModal
        open={openPaymentModal}
        transactionId={selectedId}
        transaction={selectedTransaction}
        onClose={handleClosePayment}
        onSuccess={() => fetchTransactions(false)}
      />
    </>
  );
}

export default CheckPaymentPage;
