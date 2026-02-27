import { useState, useCallback, useEffect } from 'react';

/** ISO date string (YYYY-MM-DD) */
function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseKey(key: string): Date {
  const [y, m, day] = key.split('-').map(Number);
  return new Date(y, m - 1, day);
}

function getDaysInMonth(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const days: Date[] = [];
  for (let d = 1; d <= last.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

/** Week starts Monday. Returns 0–6. */
function getDayOfWeek(d: Date): number {
  const n = d.getDay();
  return n === 0 ? 6 : n - 1;
}

/** All dates to show in the grid for one month (leading/trailing from prev/next month). */
function getGridDays(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = getDayOfWeek(first);
  const total = startPad + last.getDate();
  const rows = Math.ceil(total / 7);
  const size = rows * 7;
  const out: (Date | null)[] = [];
  for (let i = 0; i < size; i++) {
    if (i < startPad) {
      const prevMonth = new Date(year, month, 1 - (startPad - i));
      out.push(prevMonth);
    } else if (i < startPad + last.getDate()) {
      out.push(new Date(year, month, i - startPad + 1));
    } else {
      out.push(new Date(year, month + 1, i - startPad - last.getDate() + 1));
    }
  }
  return out;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface BookingCalendarProps {
  selectedDates: string[];
  onChange: (dates: string[]) => void;
  /** Minimum selectable date (ISO string). */
  minDate?: string;
  /** Maximum selectable date (ISO string). */
  maxDate?: string;
}

export function BookingCalendar({
  selectedDates,
  onChange,
  minDate,
  maxDate,
}: BookingCalendarProps) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [dragStart, setDragStart] = useState<string | null>(null);
  const [dragEnd, setDragEnd] = useState<string | null>(null);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();
  const gridDays = getGridDays(viewYear, viewMonth);

  const isDisabled = useCallback(
    (key: string) => {
      if (minDate && key < minDate) return true;
      if (maxDate && key > maxDate) return true;
      return false;
    },
    [minDate, maxDate]
  );

  const isInDragRange = useCallback(
    (key: string): boolean => {
      if (!dragStart) return false;
      const end = dragEnd ?? dragStart;
      const a = dragStart < end ? dragStart : end;
      const b = dragStart < end ? end : dragStart;
      return key >= a && key <= b;
    },
    [dragStart, dragEnd]
  );

  const isSelected = useCallback(
    (key: string) => selectedDates.includes(key),
    [selectedDates]
  );

  const setSelectionFromRange = useCallback(
    (start: string, end: string) => {
      const a = start < end ? start : end;
      const b = start < end ? end : start;
      const inRange: string[] = [];
      let d = parseKey(a);
      const endD = parseKey(b);
      while (d <= endD) {
        const k = toKey(d);
        if (!isDisabled(k)) inRange.push(k);
        d.setDate(d.getDate() + 1);
      }
      const rest = selectedDates.filter((k) => {
        const inThisRange = k >= a && k <= b;
        return !inThisRange;
      });
      const combined = [...rest, ...inRange];
      const unique = Array.from(new Set(combined)).sort();
      onChange(unique);
    },
    [selectedDates, onChange, isDisabled]
  );

  const toggleOne = useCallback(
    (key: string) => {
      if (isDisabled(key)) return;
      if (selectedDates.includes(key)) {
        onChange(selectedDates.filter((d) => d !== key));
      } else {
        onChange([...selectedDates, key].sort());
      }
    },
    [selectedDates, onChange, isDisabled]
  );

  const handleMouseDown = (e: React.MouseEvent, key: string) => {
    e.preventDefault();
    if (isDisabled(key)) return;
    setDragStart(key);
    setDragEnd(null);
  };

  const handleMouseEnter = (key: string) => {
    if (dragStart !== null && !isDisabled(key)) {
      setDragEnd(key);
    }
  };

  const handleMouseLeave = () => {
    if (dragStart !== null) {
      setDragEnd(null);
    }
  };

  useEffect(() => {
    const onDocMouseUp = () => {
      if (dragStart !== null) {
        if (dragEnd !== null) {
          setSelectionFromRange(dragStart, dragEnd);
        } else {
          toggleOne(dragStart);
        }
        setDragStart(null);
        setDragEnd(null);
      }
    };
    document.addEventListener('mouseup', onDocMouseUp);
    return () => document.removeEventListener('mouseup', onDocMouseUp);
  }, [dragStart, dragEnd, setSelectionFromRange, toggleOne]);

  const goPrev = () => {
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const goNext = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="inline-block">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={goPrev}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors"
          aria-label="Previous month"
        >
          <span className="text-lg leading-none">‹</span>
        </button>
        <span className="text-base font-semibold text-gray-900 min-w-[160px] text-center">
          {monthLabel}
        </span>
        <button
          type="button"
          onClick={goNext}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors"
          aria-label="Next month"
        >
          <span className="text-lg leading-none">›</span>
        </button>
      </div>
      <div
        className="grid grid-cols-7 gap-0.5 sm:gap-1"
        onMouseLeave={handleMouseLeave}
        role="grid"
        aria-label={`Calendar ${monthLabel}`}
      >
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="text-center text-xs sm:text-sm font-medium text-gray-500 py-1"
          >
            {wd}
          </div>
        ))}
        {gridDays.map((cell, i) => {
          if (!cell) return <div key={i} />;
          const key = toKey(cell);
          const disabled = isDisabled(key);
          const inCurrentMonth = cell.getMonth() === viewMonth;
          const selected = isSelected(key);
          const inRange = isInDragRange(key);
          const highlighted = selected || (inRange && dragStart !== null);

          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              className={`
                w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-sm sm:text-base transition-colors
                ${!inCurrentMonth ? 'text-gray-300' : 'text-gray-900'}
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                ${highlighted ? 'bg-black text-white' : 'hover:bg-gray-200'}
              `}
              onMouseDown={(e) => handleMouseDown(e, key)}
              onMouseEnter={() => handleMouseEnter(key)}
              aria-label={cell.toLocaleDateString()}
              aria-selected={selected}
            >
              {cell.getDate()}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Click dates to select one by one, or drag to select a range.
      </p>
    </div>
  );
}
