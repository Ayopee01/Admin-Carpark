"use client";

import { useEffect, useMemo, useState } from "react";
import { LuCarFront, LuChevronDown, LuSearch } from "react-icons/lu";
import TransactionsTable from "@/src/app/components/check-payment/TransactionsTable";
import PaymentModal from "@/src/app/components/check-payment/PaymentModal";
import type { TransactionEditDraft, TransactionItem, TransactionListResponse, TransactionPaymentStatus } from "@/src/app/type/check-payment/transactions";

export default function CheckPaymentPage() {
  const [plateInput, setPlateInput] = useState("");
  const [searchPlate, setSearchPlate] = useState("");
  const [status, setStatus] = useState<"all" | TransactionPaymentStatus>("all");
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TransactionEditDraft | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);

  async function fetchTransactions() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch("/api/check-payment/transactions", {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      });

      const json =
        (await response.json().catch(() => null)) as TransactionListResponse | null;

      if (!response.ok || !json) {
        throw new Error("ไม่สามารถโหลดข้อมูลได้");
      }

      setItems(json.data ?? []);
      setTotal(json.meta?.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTransactions();
  }, []);

  function handleSearch() {
    setSearchPlate(plateInput.trim());
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

  async function handleDelete(id: string) {
    // ถ้ายังไม่มี DELETE endpoint จริง ให้ลบจาก state ก่อน
    // ถ้าภายหลัง backend มี DELETE ค่อยเปลี่ยนตรงนี้เป็น fetch DELETE

    setItems((prev) => prev.filter((item) => item.id !== id));
    handleCancelEdit();
  }

  function handleOpenPayment(id: string) {
    setSelectedId(id);
    setOpenPaymentModal(true);
  }

  function handleClosePayment() {
    setOpenPaymentModal(false);
    setSelectedId(null);
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchPlate = searchPlate
        ? item.plateNo.toLowerCase().includes(searchPlate.toLowerCase())
        : true;

      const matchStatus = status === "all" ? true : item.payment.status === status;

      return matchPlate && matchStatus;
    });
  }, [items, searchPlate, status]);

  return (
    <>
      <section className="min-h-screen bg-[#EFEFEF] px-6 py-8 text-[#1F2933] md:px-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-[34px] font-extrabold leading-none text-[#2B3640]">
                ตรวจสอบและชำระเงิน
              </h1>
              <p className="mt-3 text-[15px] text-[#67727E]">• แออดมินบริการ</p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#49C85B] bg-[#F5FFF6] px-4 py-2 text-[13px] font-semibold text-[#38B449]">
              <span className="h-2 w-2 rounded-full bg-[#38B449]" />
              <span>Real-Time</span>
            </div>
          </div>

          <div className="rounded-[20px] border border-[#D8DADF] bg-[#F2F2F2] p-6 shadow-sm">
            <div className="text-center text-[20px] font-extrabold text-[#111827]">
              ค้นหาด้วยเลขทะเบียน
            </div>

            <div className="mt-5 flex flex-col gap-4 xl:flex-row">
              <div className="flex flex-1 items-center rounded-full border border-[#1C2A3A] bg-[#F4F4F4] px-6 py-4">
                <LuCarFront size={22} className="shrink-0 text-[#8D99A8]" />
                <input
                  value={plateInput}
                  onChange={(event) => setPlateInput(event.target.value)}
                  placeholder="กรอกเลขทะเบียน"
                  className="ml-4 w-full bg-transparent text-[16px] text-[#1F2933] outline-none placeholder:text-[#9AA3AF]"
                />
              </div>

              <button
                type="button"
                onClick={handleSearch}
                className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-full bg-[#061D36] px-6 py-4 text-[16px] font-semibold text-white transition hover:opacity-90"
              >
                <LuSearch size={18} />
                ค้นหา
              </button>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-[20px] border border-[#BAC0C8] bg-white shadow-sm">
            <div className="bg-[#031C36] px-6 py-5 text-white">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-[18px] font-extrabold">ผลการค้นหา</h2>
                  <span className="text-[13px] text-white/80">
                    ({filteredItems.length} รายการ)
                  </span>
                </div>

                <div className="relative">
                  <select
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as "all" | TransactionPaymentStatus)
                    }
                    className="appearance-none rounded-full bg-white px-5 py-2 pr-10 text-[14px] font-semibold text-[#1F2933] outline-none"
                  >
                    <option value="all">สถานะ</option>
                    <option value="unpaid">รอชำระ</option>
                    <option value="paid">เสร็จสิ้น</option>
                  </select>

                  <LuChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#1F2933]"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="px-6 py-10 text-[15px] text-[#47525E]">
                กำลังโหลดข้อมูล...
              </div>
            ) : error ? (
              <div className="px-6 py-10 text-[15px] text-red-600">{error}</div>
            ) : (
              <TransactionsTable
                items={filteredItems}
                editingId={editingId}
                draft={draft}
                onChangeDraft={handleChangeDraft}
                onPay={handleOpenPayment}
                onStartEdit={handleStartEdit}
                onCancelEdit={handleCancelEdit}
              />
            )}
          </div>

          <div className="mt-4 text-sm text-[#6B7280]">ทั้งหมด {total} รายการ</div>
        </div>
      </section>

      <PaymentModal
        open={openPaymentModal}
        transactionId={selectedId}
        onClose={handleClosePayment}
        onSuccess={fetchTransactions}
      />
    </>
  );
}