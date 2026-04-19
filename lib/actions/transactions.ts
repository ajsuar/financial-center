"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

const HOUSEHOLD_ID = "default-household";

export async function getTransactions(filters?: {
  type?: string;
  categoryId?: string;
  accountId?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const { type, categoryId, accountId, search, startDate, endDate, limit = 50, offset = 0 } = filters ?? {};

  return prisma.transaction.findMany({
    where: {
      account: { householdId: HOUSEHOLD_ID },
      ...(type && { type }),
      ...(categoryId && { categoryId }),
      ...(accountId && { accountId }),
      ...(search && { description: { contains: search } }),
      ...(startDate && endDate && { date: { gte: startDate, lte: endDate } }),
    },
    orderBy: { date: "desc" },
    take: limit,
    skip: offset,
    include: { category: true, member: true, account: true },
  });
}

export async function getMonthlyTransactions(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  return getTransactions({ startDate: start, endDate: end, limit: 500 });
}

export async function createTransaction(data: {
  accountId: string;
  categoryId?: string;
  memberId?: string;
  date: Date;
  description: string;
  amount: number;
  type: string;
  notes?: string;
  tags?: string[];
}) {
  const { tags, ...rest } = data;
  const tx = await prisma.transaction.create({
    data: {
      ...rest,
      tags: tags ? JSON.stringify(tags) : undefined,
    },
    include: { category: true, member: true, account: true },
  });

  // Update account balance
  const delta = data.type === "INCOME" ? data.amount : -Math.abs(data.amount);
  await prisma.account.update({
    where: { id: data.accountId },
    data: { balance: { increment: delta } },
  });

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/budget");
  return tx;
}

export async function updateTransaction(id: string, data: Partial<{
  categoryId: string;
  description: string;
  amount: number;
  date: Date;
  notes: string;
  isReviewed: boolean;
}>) {
  const tx = await prisma.transaction.update({
    where: { id },
    data,
    include: { category: true },
  });
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return tx;
}

export async function deleteTransaction(id: string) {
  const tx = await prisma.transaction.findUnique({ where: { id } });
  if (!tx) return;

  // Reverse account balance change
  const delta = tx.type === "INCOME" ? -tx.amount : Math.abs(tx.amount);
  await prisma.account.update({
    where: { id: tx.accountId },
    data: { balance: { increment: delta } },
  });

  await prisma.transaction.delete({ where: { id } });
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}

export async function getMonthlySummary(year: number, month: number) {
  const transactions = await getMonthlyTransactions(year, month);

  const income = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  const byCategory: Record<string, { name: string; color: string; icon: string | null; amount: number }> = {};
  for (const tx of transactions.filter((t) => t.type === "EXPENSE")) {
    const key = tx.categoryId ?? "uncategorized";
    if (!byCategory[key]) {
      byCategory[key] = {
        name: tx.category?.name ?? "Uncategorized",
        color: tx.category?.color ?? "#9ca3af",
        icon: tx.category?.icon ?? null,
        amount: 0,
      };
    }
    byCategory[key].amount += Math.abs(tx.amount);
  }

  return {
    income,
    expenses,
    savings: income - expenses,
    savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
    byCategory: Object.values(byCategory).sort((a, b) => b.amount - a.amount),
    transactions,
  };
}
