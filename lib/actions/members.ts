"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addMember(householdId: string, name: string, emoji: string, color: string) {
  await prisma.member.create({ data: { householdId, name, emoji, color } });
  revalidatePath("/settings");
  revalidatePath("/couple");
}
