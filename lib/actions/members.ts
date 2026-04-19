"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addMember(householdId: string, name: string, emoji: string, color: string) {
  await prisma.member.create({ data: { householdId, name, emoji, color } });
  revalidatePath("/settings");
  revalidatePath("/couple");
}

export async function updateMember(id: string, data: { name?: string; emoji?: string; color?: string }) {
  await prisma.member.update({ where: { id }, data });
  revalidatePath("/settings");
  revalidatePath("/couple");
}

export async function deleteMember(id: string) {
  await prisma.member.delete({ where: { id } });
  revalidatePath("/settings");
  revalidatePath("/couple");
}
