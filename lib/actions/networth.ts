"use server";

import { prisma } from "@/lib/db";

const HOUSEHOLD_ID = "default-household";

export async function getNetWorthHistory(months = 12) {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);

  return prisma.netWorthSnapshot.findMany({
    where: {
      householdId: HOUSEHOLD_ID,
      date: { gte: cutoff },
    },
    orderBy: { date: "asc" },
  });
}

export async function getCurrentNetWorth() {
  const accounts = await prisma.account.findMany({
    where: { householdId: HOUSEHOLD_ID, isActive: true },
  });

  const assetTypes = ["CHECKING", "SAVINGS", "INVESTMENT", "CASH", "OTHER_ASSET"];
  const liabilityTypes = ["CREDIT", "LOAN", "MORTGAGE", "OTHER_LIABILITY"];

  const totalAssets = accounts
    .filter((a) => assetTypes.includes(a.type))
    .reduce((s, a) => s + a.balance, 0);

  const totalLiabilities = Math.abs(
    accounts
      .filter((a) => liabilityTypes.includes(a.type))
      .reduce((s, a) => s + a.balance, 0)
  );

  return {
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities,
    accounts,
  };
}

export async function getCategories() {
  return prisma.category.findMany({
    where: { householdId: HOUSEHOLD_ID, parentId: null },
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
    include: { children: { orderBy: { sortOrder: "asc" } } },
  });
}
