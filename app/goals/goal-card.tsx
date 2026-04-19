"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatCurrency, formatDate, getGoalProgress, simulateGoal } from "@/lib/utils";
import { addGoalContribution, updateGoal, deleteGoal } from "@/lib/actions/goals";
import { Plus, Calendar, Zap, Pencil, Trash2 } from "lucide-react";
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

const EMOJIS = ["💰", "🛡️", "📉", "📈", "🛒", "🎯", "🏠", "🚗", "✈️", "🎓", "💍", "🌴"];

export function GoalCard({ goal }: GoalCardProps) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [monthlyContrib, setMonthlyContrib] = useState(500);
  const [selectedEmoji, setSelectedEmoji] = useState(goal.emoji);
  const router = useRouter();

  const pct = getGoalProgress(goal.currentAmount, goal.targetAmount);
  const remaining = goal.targetAmount - goal.currentAmount;
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

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    try {
      await updateGoal(goal.id, {
        name: form.get("name") as string,
        description: (form.get("description") as string) || undefined,
        targetAmount: parseFloat(form.get("targetAmount") as string),
        targetDate: form.get("targetDate") ? new Date(form.get("targetDate") as string) : undefined,
        emoji: selectedEmoji,
        isShared: form.get("isShared") === "on",
      });
      toast.success("Goal updated!");
      setEditing(false);
      router.refresh();
    } catch {
      toast.error("Failed to update goal");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${goal.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteGoal(goal.id);
      toast.success("Goal deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete goal");
    } finally {
      setDeleting(false);
    }
  }

  const progressColor = pct >= 100 ? "bg-emerald-500" : pct >= 75 ? "bg-blue-500" : "bg-indigo-500";

  return (
    <Card className="overflow-hidden">
      <div className="h-1" style={{ backgroundColor: goal.color }} />
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{goal.emoji}</span>
            <div>
              <p className="font-semibold text-slate-900">{goal.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant="secondary" className="text-xs">{GOAL_TYPE_LABELS[goal.type] ?? goal.type}</Badge>
                {goal.isShared && <Badge variant="outline" className="text-xs">💑 Shared</Badge>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <div className="text-right">
              <p className="text-lg font-bold text-slate-900">{pct.toFixed(0)}%</p>
              <p className="text-xs text-slate-400">{formatCurrency(remaining)} to go</p>
            </div>
            {/* Edit Dialog */}
            <Dialog open={editing} onOpenChange={setEditing}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Goal</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEdit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Goal Name</Label>
                    <Input name="name" defaultValue={goal.name} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Description (optional)</Label>
                    <Input name="description" defaultValue={goal.description ?? ""} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Target Amount</Label>
                      <Input name="targetAmount" type="number" step="0.01" defaultValue={goal.targetAmount} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Target Date</Label>
                      <Input name="targetDate" type="date" defaultValue={goal.targetDate ? new Date(goal.targetDate).toISOString().slice(0, 10) : ""} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Emoji</Label>
                    <div className="flex gap-2 flex-wrap">
                      {EMOJIS.map((e) => (
                        <button key={e} type="button" onClick={() => setSelectedEmoji(e)}
                          className={`text-xl p-1.5 rounded-lg border-2 transition-colors ${selectedEmoji === e ? "border-indigo-500 bg-indigo-50" : "border-transparent hover:border-slate-200"}`}>
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="isShared" name="isShared" defaultChecked={goal.isShared} />
                    <Label htmlFor="isShared">Shared goal with partner</Label>
                  </div>
                  <div className="flex justify-between pt-2">
                    <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                      <Trash2 className="h-3.5 w-3.5 mr-1" />{deleting ? "Deleting..." : "Delete"}
                    </Button>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                      <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
                    </div>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <Progress value={pct} indicatorClassName={progressColor} />
          <div className="flex justify-between text-xs text-slate-500">
            <span>{formatCurrency(goal.currentAmount)}</span>
            <span>{formatCurrency(goal.targetAmount)}</span>
          </div>
        </div>

        {/* Milestones */}
        <div className="flex gap-1.5">
          {goal.milestones.map((ms) => (
            <div
              key={ms.percentage}
              className={`flex-1 text-center text-xs py-0.5 rounded ${ms.reachedAt ? "bg-indigo-100 text-indigo-700 font-medium" : "bg-slate-100 text-slate-400"}`}
            >
              {ms.percentage}%
            </div>
          ))}
        </div>

        {/* Target date & simulator */}
        <div className="space-y-2 text-xs text-slate-500">
          {goal.targetDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              Target: {formatDate(goal.targetDate)}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3 text-amber-500" />
            <span>At</span>
            <input
              type="number"
              value={monthlyContrib}
              onChange={(e) => setMonthlyContrib(parseFloat(e.target.value) || 0)}
              className="w-16 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-700"
            />
            <span>/mo →</span>
            <span className="text-slate-700 font-medium">
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
