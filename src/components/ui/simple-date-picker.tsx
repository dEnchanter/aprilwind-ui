"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface SimpleDatePickerProps {
  onChange: (selectedDate: Date) => void;
  value?: Date;
  className?: string;
}

export function SimpleDatePicker({ onChange, value, className }: SimpleDatePickerProps) {
  const [day, setDay] = React.useState<string>("")
  const [month, setMonth] = React.useState<string>("")
  const [year, setYear] = React.useState<string>("")

  // Initialize from value prop
  React.useEffect(() => {
    if (value && value instanceof Date && !isNaN(value.getTime())) {
      setDay(value.getDate().toString())
      setMonth((value.getMonth() + 1).toString())
      setYear(value.getFullYear().toString())
    }
  }, [value])

  // When any part changes, update the date
  React.useEffect(() => {
    if (day && month && year) {
      const selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      if (!isNaN(selectedDate.getTime())) {
        onChange(selectedDate)
      }
    }
  }, [day, month, year, onChange])

  // Generate options
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1920 + 1 }, (_, i) => currentYear - i)

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]

  const getDaysInMonth = () => {
    if (!month || !year) return 31
    return new Date(parseInt(year), parseInt(month), 0).getDate()
  }

  const days = Array.from({ length: getDaysInMonth() }, (_, i) => i + 1)

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex gap-2">
        {/* Day Selector */}
        <Select value={day} onValueChange={setDay}>
          <SelectTrigger className="w-[90px]">
            <SelectValue placeholder="Day" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {days.map((d) => (
              <SelectItem key={d} value={d.toString()}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Month Selector */}
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Year Selector */}
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Display selected date */}
      {day && month && year && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CalendarIcon className="h-4 w-4" />
          <span>
            {months.find(m => m.value === month)?.label} {day}, {year}
          </span>
        </div>
      )}
    </div>
  )
}
