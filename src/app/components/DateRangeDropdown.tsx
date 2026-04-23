"use client"

import * as React from "react"
import { th } from "date-fns/locale"
import { addMonths, subMonths, startOfMonth } from "date-fns"
import { type DateRange } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

type DateRangeDropdownProps = {
  value?: DateRange
  onChange: (range: DateRange | undefined) => void
}

const START_MONTH = new Date(2020, 0)
const END_MONTH = new Date(2035, 11)

const THAI_MONTHS = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
]

const YEARS = Array.from(
  { length: END_MONTH.getFullYear() - START_MONTH.getFullYear() + 1 },
  (_, index) => START_MONTH.getFullYear() + index
)

function formatThaiDate(date: Date) {
  return new Intl.DateTimeFormat("th-TH-u-ca-gregory", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

function formatRangeLabel(range?: DateRange) {
  if (!range?.from) {
    return "เลือกช่วงวันที่"
  }

  if (range.from && !range.to) {
    return `${formatThaiDate(range.from)} - เลือกวันสิ้นสุด`
  }

  return `${formatThaiDate(range.from)} - ${formatThaiDate(range.to!)}`
}

export default function DateRangeDropdown({
  value,
  onChange,
}: DateRangeDropdownProps) {
  const [open, setOpen] = React.useState(false)
  const [month, setMonth] = React.useState<Date>(
    startOfMonth(value?.from ?? new Date())
  )

  const isRangeComplete =
    Boolean(value?.from && value?.to) &&
    value.from.getTime() !== value.to.getTime()

  const label = React.useMemo(() => formatRangeLabel(value), [value])

  React.useEffect(() => {
    if (value?.from) {
      setMonth(startOfMonth(value.from))
    }
  }, [value?.from])

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setOpen(true)
      return
    }

    if (isRangeComplete) {
      setOpen(false)
    }
  }

  function handleSelect(range: DateRange | undefined) {
    onChange(range)

    const completeRange =
      Boolean(range?.from && range?.to) &&
      range.from.getTime() !== range.to.getTime()

    if (range?.from) {
      setMonth(startOfMonth(range.from))
    }

    if (completeRange) {
      setOpen(false)
      return
    }

    setOpen(true)
  }

  const canGoPrev = month > startOfMonth(START_MONTH)
  const canGoNext = month < startOfMonth(END_MONTH)

  function handlePrevMonth() {
    if (!canGoPrev) return
    setMonth((prev) => subMonths(prev, 1))
  }

  function handleNextMonth() {
    if (!canGoNext) return
    setMonth((prev) => addMonths(prev, 1))
  }

  function handleMonthChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextMonthIndex = Number(event.target.value)
    setMonth(new Date(month.getFullYear(), nextMonthIndex, 1))
  }

  function handleYearChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextYear = Number(event.target.value)
    setMonth(new Date(nextYear, month.getMonth(), 1))
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-12 min-w-[320px] justify-between rounded-full border border-[#BFC5CC] bg-[#F3F4F6] px-5 text-[15px] font-medium text-[#1F2933] shadow-none hover:bg-white",
            !value?.from && "text-[#6B7280]"
          )}
        >
          <span className="truncate">{label}</span>
          <ChevronRight className="size-4 shrink-0 opacity-70" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={10}
        className="w-auto rounded-[18px] border border-[#DADFE5] bg-white p-3 shadow-[0_12px_40px_rgba(15,23,42,0.12)]"
        onInteractOutside={(event) => {
          if (!isRangeComplete) {
            event.preventDefault()
          }
        }}
        onEscapeKeyDown={(event) => {
          if (!isRangeComplete) {
            event.preventDefault()
          }
        }}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={!canGoPrev}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#1F2933] transition hover:bg-[#F3F4F6] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            <select
              value={month.getMonth()}
              onChange={handleMonthChange}
              className="h-8 rounded-md border border-[#D1D5DB] bg-white px-2 text-[13px] font-medium text-[#1F2933] outline-none"
            >
              {THAI_MONTHS.map((monthLabel, index) => (
                <option key={monthLabel} value={index}>
                  {monthLabel}
                </option>
              ))}
            </select>

            <select
              value={month.getFullYear()}
              onChange={handleYearChange}
              className="h-8 rounded-md border border-[#D1D5DB] bg-white px-2 text-[13px] font-medium text-[#1F2933] outline-none"
            >
              {YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            disabled={!canGoNext}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#1F2933] transition hover:bg-[#F3F4F6] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <Calendar
          month={month}
          onMonthChange={setMonth}
          mode="range"
          selected={value}
          onSelect={handleSelect}
          locale={th}
          showOutsideDays
          fixedWeeks
          hideNavigation
          startMonth={START_MONTH}
          endMonth={END_MONTH}
          min={1}
          resetOnSelect
          className="rounded-2xl bg-white p-0"
          classNames={{
            month_caption: "hidden",
            months: "flex flex-col",
            month: "space-y-3",
            weekdays: "mt-1 flex justify-between",
            weekday:
              "w-10 text-center text-[11px] font-medium text-[#9CA3AF]",
            week: "mt-1 flex justify-between",
            day: "h-10 w-10 p-0",
            day_button:
              "h-10 w-10 rounded-[10px] p-0 text-[14px] font-medium text-[#1F2933] hover:bg-[#F3F4F6]",
            range_start: "bg-[#2F3136] text-white rounded-[10px]",
            range_end: "bg-[#2F3136] text-white rounded-[10px]",
            range_middle: "bg-[#EEF2F7] text-[#1F2933] rounded-[10px]",
            selected: "bg-[#2F3136] text-white hover:bg-[#2F3136]",
            today: "font-semibold text-[#1F2933]",
            outside: "text-[#D1D5DB]",
            disabled: "text-[#D1D5DB] opacity-50",
          }}
        />

        {!isRangeComplete && (
          <p className="mt-2 text-center text-[12px] text-[#6B7280]">
            กรุณาเลือกวันเริ่มต้นและวันสิ้นสุดก่อน
          </p>
        )}
      </PopoverContent>
    </Popover>
  )
}