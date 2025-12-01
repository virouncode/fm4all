import { TimePickerValue } from "@/components/rhf/RhfDateTimePicker";
import { LOCALE, TIMEZONE } from "@/constants/time";
import { DateTime } from "luxon";


export const toTimestampFromMidnight = (time: TimePickerValue): number => {
  const rawH = parseInt(time.hours, 10);
  const rawM = parseInt(time.min, 10);

  // Normalisation minutes 0..59
  const minutes = Number.isFinite(rawM) ? Math.min(59, Math.max(0, rawM)) : 0;

  let hours24: number;

  if (time.ampm === "AM" || time.ampm === "PM") {
    // 12h -> 24h
    // "12 AM" => 0h ; "12 PM" => 12h ; sinon PM => +12
    const h12 = Number.isFinite(rawH) ? Math.min(12, Math.max(1, rawH)) : 12;
    if (time.ampm === "AM") {
      hours24 = h12 % 12; // 12 -> 0
    } else {
      hours24 = (h12 % 12) + 12; // 1..11 -> 13..23 ; 12 -> 12
    }
  } else {
    // 24h direct
    const h24 = Number.isFinite(rawH) ? rawH : 0;
    hours24 = Math.min(23, Math.max(0, h24));
  }

  const totalMinutes = hours24 * 60 + minutes;
  return totalMinutes * 60_000; // ms depuis minuit
};

export const serializeDate = (d: Date | null) => (d ? d.toISOString() : null);

export function isoDateToUtcStartOfDay(
  iso: string,
  timezone = TIMEZONE,
): Date | null {
  if (!iso) return null;

  const dt = DateTime.fromISO(iso, { zone: timezone });
  if (!dt.isValid) return null;

  return dt.startOf("day").toUTC().toJSDate();
}

export function isoDateToUtcStartOfNextDay(
  iso: string,
  timezone = TIMEZONE,
): Date | null {
  if (!iso) return null;

  const dt = DateTime.fromISO(iso, { zone: timezone });
  if (!dt.isValid) return null;

  return dt.plus({ days: 1 }).startOf("day").toUTC().toJSDate();
}

export function dateToUtcStartOfDay(
  d: Date | null,
  timezone = TIMEZONE,
): Date | null {
  if (!d) return null;

  const dt = DateTime.fromJSDate(d, { zone: timezone });
  if (!dt.isValid) return null;
  return dt.startOf("day").toUTC().toJSDate();
}

export function dateToUtcStartOfNextDay(
  d: Date | null,
  timezone = TIMEZONE,
): Date | null {
  if (!d) return null;

  const dt = DateTime.fromJSDate(d, { zone: timezone });
  if (!dt.isValid) return null;
  return dt.plus({ days: 1 }).startOf("day").toUTC().toJSDate();
}

export function formatInTimezone(
  d: Date,
  format = DateTime.DATETIME_SHORT,
  timezone = TIMEZONE,
  locale = LOCALE,
) {
  return DateTime.fromJSDate(d, { zone: timezone })
    .setLocale(locale)
    .toLocaleString(format);
}
