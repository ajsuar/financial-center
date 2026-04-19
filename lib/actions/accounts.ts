"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

const HOUSEHOLD_ID = "default-household";

export async function getAccounts() {
  return prisma.account.findMany({
    where: { householdId: HOUSEHOLD_ID, isActive: true },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
}

export async function getAccountById(id: string) {
  return prisma.account.findUnique({
    where: { id },
    include: {
      transactions: {
        orderBy: { date: "desc" },
        take: 50,
        include: { category: true, member: true },
      },
      holdings: true,
    },
  });
}

export async function createAccount(data: {
  name: string;
  type: string;
  subtype?: string;
  institution?: string;
  balance: number;
  isShared?: boolean;
  color?: string;
  notes?: string;
}) {
  const account = await prisma.account.create({
    data: { ...data, householdId: HOUSEHOLD_ID },
  });
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  revalidatePath("/net-worth");
  return account;
}

export async function updateAccount(id: string, data: Partial<{
  name: string;
  balance: number;
  institution: string;
  color: string;
  notes: string;
  isShared: boolean;
  isActive: boolean;
}>) {
  const account = await prisma.account.update({ where: { id }, data });
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  revalidatePath("/net-worth");
  return account;
}

export async function deleteAccount(id: string) {
  await prisma.account.update({ where: { id }, data: { isActive: false } });
  revalidatePath("/accounts");
  revalidatePath("/net-worth");
}

export async function takeNetWorthSnapshot() {
  const accounts = await prisma.account.findMany({
    where: { householdId: HOUSEHOLD_ID, isActive: true },
  });

  const assetTypes = ["CHECKING", "SAVINGS", "INVESTMENT", "CASH", "OTHER_ASSET"];
  const liabilityTypes = ["CREDIT", "LOAN", "MORTGAGE", "OTHER_LIABILITY"];

  const totalAssets = accounts
    .filter((a) => assetTypes.includes(a.type))
    .reduce((sum, a) => sum + a.balance, 0);

  const totalLiabilities = Math.abs(
    accounts
      .filter((a) => liabilityTypes.includes(a.type))
      .reduce((sum, a) => sum + a.balance, 0)
  );

  const breakdown: Record<string, number> = {};
  for (const acc of accounts) {
    breakdown[acc.type] = (breakdown[acc.type] ?? 0) + acc.balance;
  }

  const snapshot = await prisma.netWorthSnapshot.create({
    data: {
      householdId: HOUSEHOLD_ID,
      date: new Date(),
      totalAssets,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
      breakdown: JSON.stringify(breakdown),
    },
  });

  revalidatePath("/net-worth");
  revalidatePath("/dashboard");
  return snapshot;
}
