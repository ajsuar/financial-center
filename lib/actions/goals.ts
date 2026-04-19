"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

const HOUSEHOLD_ID = "default-household";

export async function getGoals() {
  return prisma.goal.findMany({
    where: { householdId: HOUSEHOLD_ID },
    orderBy: [{ isCompleted: "asc" }, { priority: "asc" }, { createdAt: "asc" }],
    include: {
      milestones: { orderBy: { percentage: "asc" } },
      contributions: { orderBy: { date: "desc" }, take: 5 },
    },
  });
}

export async function createGoal(data: {
  name: string;
  description?: string;
  type: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate?: Date;
  isShared?: boolean;
  color?: string;
  emoji?: string;
  priority?: number;
}) {
  const goal = await prisma.goal.create({
    data: { ...data, householdId: HOUSEHOLD_ID },
  });

  // Create default milestones
  await prisma.goalMilestone.createMany({
    data: [25, 50, 75, 100].map((p) => ({ goalId: goal.id, percentage: p })),
  });

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return goal;
}

export async function updateGoal(id: string, data: Partial<{
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  isShared: boolean;
  color: string;
  emoji: string;
  priority: number;
  isCompleted: boolean;
  celebrationSeen: boolean;
}>) {
  const goal = await prisma.goal.update({ where: { id }, data });

  // Check milestones
  const pct = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const milestones = await prisma.goalMilestone.findMany({ where: { goalId: id, reachedAt: null } });
  for (const ms of milestones) {
    if (pct >= ms.percentage) {
      await prisma.goalMilestone.update({
        where: { id: ms.id },
        data: { reachedAt: new Date() },
      });
    }
  }

  if (goal.isCompleted && !goal.completedAt) {
    await prisma.goal.update({ where: { id }, data: { completedAt: new Date() } });
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return goal;
}

export async function addGoalContribution(goalId: string, amount: number, note?: string) {
  await prisma.goalContribution.create({
    data: { goalId, amount, date: new Date(), note },
  });

  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal) return;

  const newAmount = goal.currentAmount + amount;
  return updateGoal(goalId, {
    currentAmount: newAmount,
    isCompleted: newAmount >= goal.targetAmount,
  });
}

export async function deleteGoal(id: string) {
  await prisma.goal.delete({ where: { id } });
  revalidatePath("/goals");
}

