"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BsQrCode } from "react-icons/bs";
import { FiCreditCard, FiRepeat, FiDollarSign } from "react-icons/fi";
import type {
  UserActivityChannelItem,
  UserActivityPoint,
} from "@/src/app/lib/summary/summary-user-activity";

type UserActivityChartProps = {
  title?: string;
  description?: string;
  periodLabel?: string;
  data: UserActivityPoint[];
  channels: UserActivityChannelItem[];
  totalRevenue: number;
  highlightLabel?: string;
};

function formatAmount(amount: number) {
  return new Intl.NumberFormat("th-TH").format(amount);
}

function getChannelIcon(code: string) {
  const className =
    "flex h-10 w-10 items-center justify-center rounded-[10px] bg-white text-[#2B3640]";

  switch (code) {
    case "cash":
      return (
        <div className={className}>
          <FiCreditCard size={18} />
        </div>
      );

    case "qr":
      return (
        <div className={className}>
          <BsQrCode size={18} />
        </div>
      );

    case "transfer":
      return (
        <div className={className}>
          <FiRepeat size={18} />
        </div>
      );

    default:
      return (
        <div className={className}>
          <FiDollarSign size={18} />
        </div>
      );
  }
}

function UserActivityChart({
  title = "สถิติการใช้งานของผู้ใช้",
  description = "ข้อมูลตอบรับของผู้ใช้บริการ (ฝั่ง) รายสัปดาห์",
  periodLabel = "สัปดาห์",
  data,
  channels,
  totalRevenue,
  highlightLabel,
}: UserActivityChartProps) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_232px]">
      <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[18px] font-extrabold leading-none text-[#2B3640]">
              {title}
            </h3>
            <p className="mt-2 text-[12px] text-[#7A8795]">{description}</p>
          </div>

          <div className="inline-flex items-center gap-2 pt-1 text-[12px] font-medium text-[#4B5563]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#31C65B]" />
            <span>{periodLabel}</span>
          </div>
        </div>

        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 8, left: -24, bottom: 0 }}
            >
              <CartesianGrid stroke="#EDF1F5" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={({ x, y, payload }) => {
                  const isActive = payload.value === highlightLabel;

                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={0}
                        y={18}
                        textAnchor="middle"
                        className={`text-[11px] ${isActive
                          ? "fill-[#2F80ED] font-semibold"
                          : "fill-[#6B7280]"
                          }`}
                      >
                        {payload.value}
                      </text>
                    </g>
                  );
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={false}
                width={24}
              />
              <Tooltip
                formatter={(value) => {
                  const count = Number(value ?? 0);
                  return [
                    `${new Intl.NumberFormat("th-TH").format(count)} รายการ`,
                    "จำนวนผู้ใช้",
                  ];
                }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8EC1F5"
                strokeWidth={5}
                dot={false}
                activeDot={{
                  r: 5,
                  stroke: "#8EC1F5",
                  strokeWidth: 2,
                  fill: "#FFFFFF",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-[20px] bg-[#DCDDDF] px-6 py-6">
        <h3 className="text-[18px] font-extrabold leading-none text-[#2B3640]">
          สรุปรายได้ตามช่องทางบริการ
        </h3>

        <div className="mt-6 space-y-4">
          {channels.map((item) => (
            <div
              key={item.code}
              className="flex items-start justify-between gap-3 border-b border-black/5 pb-4 last:border-b-0 last:pb-0"
            >
              <div className="flex items-start gap-3">
                {getChannelIcon(item.code)}

                <div>
                  <p className="text-[14px] font-semibold leading-none text-[#2B3640]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-[12px] text-[#6B7280]">
                    {item.count} รายการ
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[20px] font-extrabold leading-none text-[#2B3640]">
                  {formatAmount(item.amount)}
                  <span className="ml-1 text-[14px] font-bold">฿</span>
                </p>
                <p className="mt-2 text-[12px] font-semibold text-[#2B3640]">
                  {item.percent}%
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-black/10 pt-5">
          <div className="flex items-end justify-between gap-4">
            <p className="text-[14px] font-semibold text-[#4B5563]">
              รายได้รวมทั้งหมด
            </p>

            <p className="text-[32px] font-extrabold leading-none text-[#1F2933]">
              {formatAmount(totalRevenue)}
              <span className="ml-1 text-[18px] font-bold">฿</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserActivityChart;