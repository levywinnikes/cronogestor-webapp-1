import type { EmployeeLaborContext } from "./types";

export interface DayClassificationInput {
  workDate: string;
  isHoliday: boolean;
  totalUniqueMinutes: number;
  projectEffectiveMinutes: Map<string, number>;
  labor: EmployeeLaborContext;
}

export interface ProjectBucketAllocation {
  normalMinutes: number;
  overtimeFirstTwoMinutes: number;
  overtimeAfterTwoMinutes: number;
  saturdayMinutes: number;
  sundayOrHolidayMinutes: number;
  nightMinutes: number;
  calculatedAmount: number;
}

export interface DayBucketTotals {
  normalMinutes: number;
  overtimeFirstTwoMinutes: number;
  overtimeAfterTwoMinutes: number;
  saturdayMinutes: number;
  sundayOrHolidayMinutes: number;
  nightMinutes: number;
}

function classifyDayTotals(
  input: DayClassificationInput,
): DayBucketTotals {
  const { workDate, isHoliday, totalUniqueMinutes, labor } = input;
  const workDateObj = new Date(`${workDate}T00:00:00.000Z`);
  const dayOfWeek = workDateObj.getUTCDay();
  const isSunday = dayOfWeek === 0;
  const isSaturday = dayOfWeek === 6;
  const normalLimitMinutes = labor.hoursPerDay * 60;

  const totals: DayBucketTotals = {
    normalMinutes: 0,
    overtimeFirstTwoMinutes: 0,
    overtimeAfterTwoMinutes: 0,
    saturdayMinutes: 0,
    sundayOrHolidayMinutes: 0,
    nightMinutes: 0,
  };

  if (isHoliday || isSunday) {
    totals.sundayOrHolidayMinutes = totalUniqueMinutes;
    return totals;
  }

  if (isSaturday) {
    totals.saturdayMinutes = totalUniqueMinutes;
    return totals;
  }

  totals.normalMinutes = Math.min(totalUniqueMinutes, normalLimitMinutes);
  const extraMinutes = Math.max(totalUniqueMinutes - normalLimitMinutes, 0);
  totals.overtimeFirstTwoMinutes = Math.min(extraMinutes, 120);
  totals.overtimeAfterTwoMinutes = Math.max(extraMinutes - 120, 0);

  return totals;
}

function distributeMinutes(total: number, weights: Map<string, number>): Map<string, number> {
  const projectIds = [...weights.keys()].sort();
  const weightSum = projectIds.reduce((sum, id) => sum + (weights.get(id) ?? 0), 0);
  const result = new Map<string, number>();

  if (total <= 0 || weightSum <= 0) {
    for (const id of projectIds) result.set(id, 0);
    return result;
  }

  const exactShares = projectIds.map((id) => ({
    id,
    exact: (total * (weights.get(id) ?? 0)) / weightSum,
  }));

  let assigned = 0;
  const floors = exactShares.map(({ id, exact }) => {
    const floored = Math.floor(exact);
    assigned += floored;
    return { id, floored, remainder: exact - floored };
  });

  let remaining = total - assigned;
  floors.sort((a, b) => b.remainder - a.remainder || a.id.localeCompare(b.id));

  for (const item of floors) {
    let value = item.floored;
    if (remaining > 0) {
      value += 1;
      remaining -= 1;
    }
    result.set(item.id, value);
  }

  return result;
}

export function allocateBucketsToProjects(
  input: DayClassificationInput,
): Map<string, ProjectBucketAllocation> {
  const dayTotals = classifyDayTotals(input);
  const weights = input.projectEffectiveMinutes;
  const { labor } = input;
  const workDateObj = new Date(`${input.workDate}T00:00:00.000Z`);
  const dayOfWeek = workDateObj.getUTCDay();
  const isSunday = dayOfWeek === 0;
  const isHoliday = input.isHoliday;

  const normalMap = distributeMinutes(dayTotals.normalMinutes, weights);
  const ot50Map = distributeMinutes(dayTotals.overtimeFirstTwoMinutes, weights);
  const ot100Map = distributeMinutes(dayTotals.overtimeAfterTwoMinutes, weights);
  const saturdayMap = distributeMinutes(dayTotals.saturdayMinutes, weights);
  const sundayHolidayMap = distributeMinutes(dayTotals.sundayOrHolidayMinutes, weights);

  const result = new Map<string, ProjectBucketAllocation>();

  for (const projectId of [...weights.keys()].sort()) {
    const normalMinutes = normalMap.get(projectId) ?? 0;
    const overtimeFirstTwoMinutes = ot50Map.get(projectId) ?? 0;
    const overtimeAfterTwoMinutes = ot100Map.get(projectId) ?? 0;
    const saturdayMinutes = saturdayMap.get(projectId) ?? 0;
    const sundayOrHolidayMinutes = sundayHolidayMap.get(projectId) ?? 0;

    const calculatedAmount =
      (normalMinutes / 60) * labor.hourlyBase +
      (overtimeFirstTwoMinutes / 60) *
        labor.hourlyBase *
        (1 + labor.policy.weekdayFirstTwoPercent / 100) +
      (overtimeAfterTwoMinutes / 60) *
        labor.hourlyBase *
        (1 + labor.policy.weekdayAfterTwoPercent / 100) +
      (saturdayMinutes / 60) *
        labor.hourlyBase *
        (1 + labor.policy.saturdayPercent / 100) +
      (sundayOrHolidayMinutes / 60) *
        labor.hourlyBase *
        (1 +
          (isHoliday ? labor.policy.holidayPercent : labor.policy.sundayPercent) / 100);

    result.set(projectId, {
      normalMinutes,
      overtimeFirstTwoMinutes,
      overtimeAfterTwoMinutes,
      saturdayMinutes,
      sundayOrHolidayMinutes,
      nightMinutes: 0,
      calculatedAmount: Math.round(calculatedAmount * 100) / 100,
    });
  }

  return result;
}
