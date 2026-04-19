"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

const HOUSEHOLD_ID = "default-household";

export async function getBudgetForMonth(year: number, month: number) {
  return prisma.budget.findFirst({
    where: {
      householdId: HOUSEHOLD_ID,
      period: "MONTHLY",
      month,
      year,
      isActive: true,
    },
    include: {
      lines: {
        include: { category: true },
        orderBy: { category: { sortOrder: "asc" } },
      },
    },
  });
}

export async function createMonthlyBudget(year: number, month: number, name?: string) {
  const monthName = new Date(year, month - 1).toLocaleString("default", { month: "long" });
  const budget = await prisma.budget.create({
    data: {
      householdId: HOUSEHOLD_ID,
      name: name ?? `${monthName} ${year} Budget`,
      period: "MONTHLY",
      month,
      year,
      isActive: true,
    },
  });
  revalidatePath("/budget");
  return budget;
}

export async function upsertBudgetLine(budgetId: string, categoryId: string, allocated: number) {
  const existing = await prisma.budgetLine.findUnique({
    where: { budgetId_categoryId: { budgetId, categoryId } },
  });

  if (existing) {
    await prisma.budgetLine.update({
      where: { id: existing.id },
      data: { allocated },
    });
  } else {
    await prisma.budgetLine.create({
      data: { budgetId, categoryId, allocated },
    });
  }
  revalidatePath("/budget");
}

export async function deleteBudgetLine(id: string) {
  await prisma.budgetLine.delete({ where: { id } });
  revalidatePath("/budget");
}

export async function getBudgetProgress(budgetId: string, year: number, month: number) {
  const budget = await prisma.budget.findUnique({
    where: { id: budgetId },
    include: { lines: { include: { category: true } } },
  });
  if (!budget) return null;

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const transactions = await prisma.transaction.findMany({
    where: {
      account: { householdId: HOUSEHOLD_ID },
      date: { gte: start, lte: end },
      type: "EXPENSE",
    },
  });

  const spentByCategory: Record<string, number> = {};
  for (const tx of transactions) {
    const key = tx.categoryId ?? "uncategorized";
    spentByCategory[key] = (spentByCategory[key] ?? 0) + Math.abs(tx.amount);
  }

  const lines = budget.lines.map((line) => ({
    ...line,
    spent: spentByCategory[line.categoryId] ?? 0,
    remaining: line.allocated - (spentByCategory[line.categoryId] ?? 0),
    pct: line.allocated > 0 ? Math.min(100, ((spentByCategory[line.categoryId] ?? 0) / line.allocated) * 100) : 0,
  }));

  const totalAllocated = lines.reduce((s, l) => s + l.allocated, 0);
  const totalSpent = lines.reduce((s, l) => s + l.spent, 0);

  return { budget, lines, totalAllocated, totalSpent, totalRemaining: totalAllocated - totalSpent };
}
