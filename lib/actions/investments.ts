"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

const HOUSEHOLD_ID = "default-household";

export async function getInvestmentAccounts() {
  return prisma.account.findMany({
    where: {
      householdId: HOUSEHOLD_ID,
      type: "INVESTMENT",
      isActive: true,
    },
    include: {
      holdings: { orderBy: { currentValue: "desc" } },
    },
  });
}

export async function getPortfolioSummary() {
  const accounts = await getInvestmentAccounts();
  const allHoldings = accounts.flatMap((a) => a.holdings);

  const totalValue = allHoldings.reduce((s, h) => s + h.currentValue, 0);
  const totalCostBasis = allHoldings.reduce((s, h) => s + h.costBasis, 0);
  const totalGain = totalValue - totalCostBasis;
  const gainPct = totalCostBasis > 0 ? (totalGain / totalCostBasis) * 100 : 0;

  const byAssetClass: Record<string, number> = {};
  for (const h of allHoldings) {
    byAssetClass[h.assetClass] = (byAssetClass[h.assetClass] ?? 0) + h.currentValue;
  }

  const allocation = Object.entries(byAssetClass).map(([cls, value]) => ({
    assetClass: cls,
    value,
    pct: totalValue > 0 ? (value / totalValue) * 100 : 0,
  }));

  return { accounts, allHoldings, totalValue, totalCostBasis, totalGain, gainPct, allocation };
}

export async function createHolding(data: {
  accountId: string;
  ticker?: string;
  name: string;
  assetClass: string;
  quantity: number;
  costBasis: number;
  currentPrice: number;
  currentValue: number;
}) {
  const holding = await prisma.investmentHolding.create({ data });
  await prisma.account.update({
    where: { id: data.accountId },
    data: { balance: { increment: data.currentValue } },
  });
  revalidatePath("/investments");
  revalidatePath("/net-worth");
  return holding;
}

export async function updateHoldingPrice(id: string, currentPrice: number, currentValue: number) {
  const old = await prisma.investmentHolding.findUnique({ where: { id } });
  if (!old) return;

  const holding = await prisma.investmentHolding.update({
    where: { id },
    data: { currentPrice, currentValue, priceUpdatedAt: new Date() },
  });

  const valueDelta = currentValue - old.currentValue;
  await prisma.account.update({
    where: { id: old.accountId },
    data: { balance: { increment: valueDelta } },
  });

  // Save price history point
  await prisma.holdingPricePoint.create({
    data: { holdingId: id, date: new Date(), price: currentPrice, value: currentValue },
  });

  revalidatePath("/investments");
  revalidatePath("/net-worth");
  revalidatePath("/dashboard");
  return holding;
}
