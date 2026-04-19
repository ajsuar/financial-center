"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

const HOUSEHOLD_ID = "default-household";

export async function getSubscriptions() {
  return prisma.recurringRule.findMany({
    where: {
      household: { id: HOUSEHOLD_ID },
      isSubscription: true,
      isActive: true,
    },
    orderBy: { amount: "desc" },
  });
}

export async function createSubscription(data: {
  name: string;
  amount: number;
  frequency: string;
  provider?: string;
  nextDue: Date;
  categoryId?: string;
}) {
  const household = await prisma.household.findUnique({ where: { id: HOUSEHOLD_ID } });
  if (!household) throw new Error("Household not found");

  await prisma.recurringRule.create({
    data: {
      ...data,
      householdId: HOUSEHOLD_ID,
      isSubscription: true,
      isActive: true,
    },
  });
  revalidatePath("/subscriptions");
  revalidatePath("/dashboard");
}

export async function updateSubscription(id: string, data: {
  name?: string;
  amount?: number;
  frequency?: string;
  provider?: string;
  nextDue?: Date;
}) {
  await prisma.recurringRule.update({ where: { id }, data });
  revalidatePath("/subscriptions");
}

export async function deleteSubscription(id: string) {
  await prisma.recurringRule.update({ where: { id }, data: { isActive: false } });
  revalidatePath("/subscriptions");
  revalidatePath("/dashboard");
}
