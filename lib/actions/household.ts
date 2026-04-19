"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

const HOUSEHOLD_ID = "default-household";

export async function getHousehold() {
  return prisma.household.findUnique({
    where: { id: HOUSEHOLD_ID },
    include: { members: true },
  });
}

export async function getHouseholdId() {
  return HOUSEHOLD_ID;
}
