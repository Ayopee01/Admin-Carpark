import { FiCheckCircle, FiClock, FiFileText, FiCalendar } from "react-icons/fi";
import { BsQrCode } from "react-icons/bs";
import { FaParking, FaMoneyBillWave } from "react-icons/fa";
import { LuZap } from "react-icons/lu";
import type {
    DashboardProgressCard,
    DashboardStatCard,
    DashboardFilters,
} from "@/src/app/type/dashboard/dashboard";
import type { DashboardTransaction } from "@/src/app/hooks/useDashboardTransactions";

export type UserActivityPoint = {
    label: string;
    value: number;
};

export type UserActivityChannelItem = {
    code: string;
    label: string;
    amount: number;
    count: number;
    percent: number;
};

export type SummaryFromTransactionsResult = {
    summaryCards: DashboardStatCard[];
    serviceCards: DashboardProgressCard[];
    chartData: UserActivityPoint[];
    channels: UserActivityChannelItem[];
    totalRevenue: number;
    highlightLabel: string;
};

function formatNumber(value: number) {
    return new Intl.NumberFormat("th-TH").format(Number(value ?? 0));
}

function formatDateKey(dateString: string) {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Bangkok",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date(dateString));
}

function getThaiDayLabel(dateString: string) {
    const days = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์"];

    return new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Bangkok",
        weekday: "long",
    }).format(new Date(dateString)) === "Sunday"
        ? days[0]
        : new Intl.DateTimeFormat("en-US", {
            timeZone: "Asia/Bangkok",
            weekday: "long",
        }).format(new Date(dateString)) === "Monday"
            ? days[1]
            : new Intl.DateTimeFormat("en-US", {
                timeZone: "Asia/Bangkok",
                weekday: "long",
            }).format(new Date(dateString)) === "Tuesday"
                ? days[2]
                : new Intl.DateTimeFormat("en-US", {
                    timeZone: "Asia/Bangkok",
                    weekday: "long",
                }).format(new Date(dateString)) === "Wednesday"
                    ? days[3]
                    : new Intl.DateTimeFormat("en-US", {
                        timeZone: "Asia/Bangkok",
                        weekday: "long",
                    }).format(new Date(dateString)) === "Thursday"
                        ? days[4]
                        : new Intl.DateTimeFormat("en-US", {
                            timeZone: "Asia/Bangkok",
                            weekday: "long",
                        }).format(new Date(dateString)) === "Friday"
                            ? days[5]
                            : days[6];
}

function toDate(value: string) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function buildDateRange(startDate: string, endDate: string) {
    const dates: string[] = [];
    const current = toDate(startDate);
    const end = toDate(endDate);

    while (current <= end) {
        dates.push(
            `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(
                2,
                "0"
            )}-${String(current.getDate()).padStart(2, "0")}`
        );

        current.setDate(current.getDate() + 1);
    }

    return dates;
}

function getDefaultDateRange(transactions: DashboardTransaction[]) {
    if (transactions.length === 0) {
        const today = new Date();
        const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
            2,
            "0"
        )}-${String(today.getDate()).padStart(2, "0")}`;

        return { startDate: key, endDate: key };
    }

    const sorted = [...transactions].sort(
        (a, b) =>
            new Date(a.entryAt).getTime() - new Date(b.entryAt).getTime()
    );

    return {
        startDate: formatDateKey(sorted[0].entryAt),
        endDate: formatDateKey(sorted[sorted.length - 1].entryAt),
    };
}

function isInDateRangeByEntryAt(
    entryAt: string,
    filters: DashboardFilters,
    fallbackRange: { startDate: string; endDate: string }
) {
    const target = formatDateKey(entryAt);
    const startDate = filters.startDate ?? fallbackRange.startDate;
    const endDate = filters.endDate ?? fallbackRange.endDate;

    return target >= startDate && target <= endDate;
}

function getServiceTitle(serviceType: string) {
    switch (serviceType) {
        case "parking":
            return "ค่าจอดรถ";
        case "ev":
            return "EV Charge";
        case "booking":
            return "ค่าจอง";
        default:
            return serviceType;
    }
}

function getServiceDescription(serviceType: string) {
    switch (serviceType) {
        case "parking":
            return "สรุปรายการค่าจอดรถ";
        case "ev":
            return "สรุปรายการชาร์จ EV";
        case "booking":
            return "สรุปรายการจอง";
        default:
            return serviceType;
    }
}

function getServiceIcon(serviceType: string) {
    switch (serviceType) {
        case "parking":
            return FaParking;
        case "ev":
            return LuZap;
        case "booking":
            return FiCalendar;
        default:
            return FiFileText;
    }
}

function getPaymentMethodLabel(method: string) {
    switch (method) {
        case "cash":
            return "เงินสด";
        case "qr":
            return "QR Payment";
        case "transfer":
            return "โอนเงิน";
        default:
            return method;
    }
}

export function buildSummaryFromTransactions(
    transactions: DashboardTransaction[],
    filters: DashboardFilters
): SummaryFromTransactionsResult {
    const fallbackRange = getDefaultDateRange(transactions);

    const filteredTransactions = transactions.filter((tx) =>
        isInDateRangeByEntryAt(tx.entryAt, filters, fallbackRange)
    );

    const totalBills = filteredTransactions.length;
    const paidBills = filteredTransactions.filter(
        (tx) => tx.status === "completed"
    ).length;
    const unpaidBills = filteredTransactions.filter(
        (tx) => tx.status === "pending"
    ).length;

    const paidTransactions = filteredTransactions.filter(
        (tx) => tx.payment.status === "paid" && tx.payment.method
    );

    const totalPaidRevenue = paidTransactions.reduce(
        (sum, tx) => sum + Number(tx.netAmount ?? tx.amount ?? 0),
        0
    );

    const summaryCards: DashboardStatCard[] = [
        {
            key: "totalBills",
            title: "บิลทั้งหมด",
            value: formatNumber(totalBills),
            unit: "tickets",
            note: "Filtered Total",
            icon: FiFileText,
        },
        {
            key: "paidBills",
            title: "ชำระเงินแล้ว",
            value: formatNumber(paidBills),
            note: `฿ ${formatNumber(totalPaidRevenue)} Total`,
            icon: FiCheckCircle,
        },
        {
            key: "unpaidBills",
            title: "บิลค้างชำระ",
            value: formatNumber(unpaidBills),
            unit: "pending",
            note: "Filtered Pending",
            icon: FiClock,
        },
    ];

    const serviceMap = new Map<
        string,
        { count: number; amount: number }
    >();

    for (const tx of filteredTransactions) {
        const current = serviceMap.get(tx.serviceType) ?? { count: 0, amount: 0 };

        serviceMap.set(tx.serviceType, {
            count: current.count + 1,
            amount: current.amount + Number(tx.netAmount ?? tx.amount ?? 0),
        });
    }

    const totalServiceAmount = Array.from(serviceMap.values()).reduce(
        (sum, item) => sum + item.amount,
        0
    );

    const serviceCards: DashboardProgressCard[] = Array.from(serviceMap.entries()).map(
        ([serviceType, value]) => ({
            key: serviceType,
            title: getServiceTitle(serviceType),
            description: getServiceDescription(serviceType),
            subText: `${formatNumber(value.count)} รายการ`,
            amount: `฿${formatNumber(value.amount)}`,
            percent:
                totalServiceAmount > 0
                    ? Math.round((value.amount / totalServiceAmount) * 100)
                    : 0,
            icon: getServiceIcon(serviceType),
        })
    );

    const paymentMap = new Map<
        string,
        { count: number; amount: number }
    >();

    for (const tx of paidTransactions) {
        const method = tx.payment.method;

        if (!method) continue;

        const current = paymentMap.get(method) ?? { count: 0, amount: 0 };

        paymentMap.set(method, {
            count: current.count + 1,
            amount: current.amount + Number(tx.netAmount ?? tx.amount ?? 0),
        });
    }

    const channels: UserActivityChannelItem[] = Array.from(paymentMap.entries()).map(
        ([method, value]) => ({
            code: method,
            label: getPaymentMethodLabel(method),
            count: value.count,
            amount: value.amount,
            percent:
                totalPaidRevenue > 0
                    ? Math.round((value.amount / totalPaidRevenue) * 100)
                    : 0,
        })
    );

    const startDate = filters.startDate ?? fallbackRange.startDate;
    const endDate = filters.endDate ?? fallbackRange.endDate;
    const allDays = buildDateRange(startDate, endDate);

    const countByDay = new Map<string, number>();

    for (const tx of filteredTransactions) {
        const key = formatDateKey(tx.entryAt);
        countByDay.set(key, (countByDay.get(key) ?? 0) + 1);
    }

    const chartData: UserActivityPoint[] = allDays.map((dateKey) => ({
        label: getThaiDayLabel(dateKey),
        value: countByDay.get(dateKey) ?? 0,
    }));

    const highlightLabel =
        chartData.length > 0
            ? chartData[chartData.length - 1].label
            : "วันนี้";

    return {
        summaryCards,
        serviceCards,
        chartData,
        channels,
        totalRevenue: totalPaidRevenue,
        highlightLabel,
    };
}