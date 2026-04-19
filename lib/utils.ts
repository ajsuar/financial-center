import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency = "USD",
  compact = false
): string {
  const opts: Intl.NumberFormatOptions = {
    style: "currency",
    currency,
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 2,
  };
  return new Intl.NumberFormat("en-US", opts).format(amount);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

export function formatDate(date: Date | string, format = "short"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (format === "short") {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  if (format === "month-year") {
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }
  return d.toLocaleDateString("en-US");
}

export function getAccountTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    CHECKING: "Checking",
    SAVINGS: "Savings",
    INVESTMENT: "Investment",
    CREDIT: "Credit Card",
    LOAN: "Loan",
    MORTGAGE: "Mortgage",
    CASH: "Cash",
    OTHER_ASSET: "Other Asset",
    OTHER_LIABILITY: "Other Liability",
  };
  return labels[type] ?? type;
}

export function isAssetAccount(type: string): boolean {
  return ["CHECKING", "SAVINGS", "INVESTMENT", "CASH", "OTHER_ASSET"].includes(type);
}

export function isLiabilityAccount(type: string): boolean {
  return ["CREDIT", "LOAN", "MORTGAGE", "OTHER_LIABILITY"].includes(type);
}

export function getGoalProgress(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, (current / target) * 100);
}

export function getNextMilestone(progressPct: number): number | null {
  const milestones = [25, 50, 75, 100];
  return milestones.find((m) => m > progressPct) ?? null;
}

export function netWorthMilestones(): number[] {
  return [1000, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];
}

export function simulateGoal(
  targetAmount: number,
  currentAmount: number,
  monthlyContribution: number,
  annualGrowthRate = 0
): { months: number; date: Date | null } {
  if (monthlyContribution <= 0) return { months: Infinity, date: null };
  const remaining = targetAmount - currentAmount;
  if (remaining <= 0) return { months: 0, date: new Date() };

  if (annualGrowthRate <= 0) {
    const months = Math.ceil(remaining / monthlyContribution);
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return { months, date };
  }

  const r = annualGrowthRate / 100 / 12;
  let months = 0;
  let balance = currentAmount;
  while (balance < targetAmount && months < 600) {
    balance = balance * (1 + r) + monthlyContribution;
    months++;
  }
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return { months, date };
}
