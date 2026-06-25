import { format as fnsFormat, parseISO as fnsParseISO } from "date-fns";
import { id } from "date-fns/locale";

export function formatDate(date: string | Date, fmt: string): string {
  return fnsFormat(typeof date === "string" ? fnsParseISO(date) : date, fmt, {
    locale: id,
  });
}

export function parseISO(date: string): Date {
  return fnsParseISO(date);
}
