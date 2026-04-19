"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatDate, getGoalProgress, simulateGoal } from "@/lib/utils";
import { addGoalContribution } from "@/lib/actions/goals";
import { Plus, Calendar, Zap } from "lucide-react";
import { toast } from "sonner";

interface GoalCardProps {
  goal: {
    id: string;
    name: string;
    description: string | null;
    type: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: Date | null;
    isShared: boolean;
    color: string;
    emoji: string;
    milestones: Array<{ percentage: number; reachedAt: Date | null }>;
  };
}

const GOAL_TYPE_LABELS: Record<string, string> = {
  SAVINGS: "Savings",
  DEBT_PAYOFF: "Debt Payoff",
  INVESTMENT: "Investment",
  PURCHASE: "Purchase",
  EMERGENCY_FUND: "Emergency Fund",
  CUSTOM: "Custom",
};

export function GoalCard({ goal }: GoalCardProps) {
  const [adding, setAdding] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [monthlyContrib, setMonthlyContrib] = useState(500);
  const router = useRouter();

  const pct = getGoalProgress(goal.currentAmount, goal.targetAmount);
  const remaining = goal.targetAmount - goal.currentAmount;
  const reachedMilestones = goal.milestones.filter((m) => m.reachedAt);
  const nextMilestone = goal.milestones.find((m) => !m.reachedAt && m.percentage > pct);

  const simulation = simulateGoal(goal.targetAmount, goal.currentAmount, monthlyContrib, 0);

  async function handleContribute() {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    setLoading(true);
    try {
      await addGoalContribution(goal.id, val);
      toast.success(`Added ${formatCurrency(val)} to ${goal.name}!`);
      setAdding(false);
      setAmount("");
      router.refresh();
    } catch {
      toast.error("Failed to add contribution");
    } finally {
      setLoading(false);
    }
  }

  const progressColor = pct >= 100 ? "bg-emerald-500" : pct >= 75 ? "bg-blue-500" : pct >= 50 ? "bg-indigo-500" : "bg-indigo-500";

  return (
    <Card className="overflow-hidden">
      {/* Color strip */}
      <div className="h-1" style={{ backgroundColor: goal.color }} />
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{goal.emoji}</span>
            <div>
              <p className="font-semibold text-zinc-100">{goal.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant="secondary" className="text-xs">{GOAL_TYPE_LABELS[goal.type] ?? goal.type}</Badge>
                {goal.isShared && <Badge variant="outline" className="text-xs">💑 Shared</Badge>}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-zinc-100">{pct.toFixed(0)}%</p>
            <p className="text-xs text-zinc-500">{formatCurrency(remaining)} to go</p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <Progress value={pct} indicatorClassName={progressColor} />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>{formatCurrency(goal.currentAmount)}</span>
            <span>{formatCurrency(goal.targetAmount)}</span>
          </div>
        </div>

        {/* Milestones */}
        <div className="flex gap-1.5">
          {goal.milestones.map((ms) => (
            <div
              key={ms.percentage}
              className={`flex-1 text-center text-xs py-0.5 rounded ${ms.reachedAt ? "bg-indigo-900/50 text-indigo-300" : "bg-zinc-800 text-zinc-600"}`}
            >
              {ms.percentage}%
            </div>
          ))}
        </div>

        {/* Target date & simulator */}
        <div className="space-y-2 text-xs text-zinc-500">
          {goal.targetDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              Target: {formatDate(goal.targetDate)}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3 text-amber-400" />
            <span>At</span>
            <input
              type="number"
              value={monthlyContrib}
              onChange={(e) => setMonthlyContrib(parseFloat(e.target.value) || 0)}
              className="w-16 bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 text-xs text-zinc-200"
            />
            <span>/mo → </span>
            <span className="text-zinc-300 font-medium">
              {simulation.months === Infinity ? "never" : simulation.months === 0 ? "already reached!" :
                simulation.date ? formatDate(simulation.date, "short") : `${simulation.months} months`}
            </span>
          </div>
        </div>

        {/* Add contribution */}
        {!adding ? (
          <Button size="sm" className="w-full" onClick={() => setAdding(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />Add Contribution
          </Button>
        ) : (
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-8 text-sm"
              autoFocus
            />
            <Button size="sm" onClick={handleContribute} disabled={loading}>
              {loading ? "..." : "Add"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
