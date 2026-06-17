export function formatTimeSheetCurrency(value: number, language: string): string {
  const locale = language.startsWith("en") ? "en-US" : "pt-BR";
  return value.toLocaleString(locale, { style: "currency", currency: "BRL" });
}

export function formatReferencePeriod(
  month: number,
  year: number,
  language: string,
): string {
  const locale = language.startsWith("en") ? "en-US" : "pt-BR";
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
    new Date(year, month - 1, 1),
  );
}

export function formatDisplayDate(isoDate: string, language: string): string {
  const locale = language.startsWith("en") ? "en-US" : "pt-BR";
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat(locale).format(new Date(year, month - 1, day));
}

type TimeEntryPeriodsSource = {
  startTime: string;
  endTime: string;
  startTime2?: string | null;
  endTime2?: string | null;
  startTime3?: string | null;
  endTime3?: string | null;
  startTime4?: string | null;
  endTime4?: string | null;
};

export function getTimeEntryPeriods(
  entry: TimeEntryPeriodsSource,
): [string, string][] {
  return [
    [entry.startTime, entry.endTime],
    [entry.startTime2, entry.endTime2],
    [entry.startTime3, entry.endTime3],
    [entry.startTime4, entry.endTime4],
  ].filter((period): period is [string, string] =>
    Boolean(period[0] && period[1]),
  );
}

export function formatTimeEntrySpan(periods: [string, string][]): string | null {
  if (periods.length === 0) {
    return null;
  }

  const [firstStart] = periods[0];
  const [, lastEnd] = periods[periods.length - 1];
  return `${firstStart}–${lastEnd}`;
}
