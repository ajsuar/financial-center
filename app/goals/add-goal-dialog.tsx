"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createGoal } from "@/lib/actions/goals";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const GOAL_TYPES = [
  { value: "SAVINGS", label: "💰 Savings", emoji: "💰" },
  { value: "EMERGENCY_FUND", label: "🛡️ Emergency Fund", emoji: "🛡️" },
  { value: "DEBT_PAYOFF", label: "📉 Debt Payoff", emoji: "📉" },
  { value: "INVESTMENT", label: "📈 Investment", emoji: "📈" },
  { value: "PURCHASE", label: "🛒 Purchase", emoji: "🛒" },
  { value: "CUSTOM", label: "🎯 Custom", emoji: "🎯" },
];

const COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#ec4899", "#3b82f6",
  "#8b5cf6", "#ef4444", "#06b6d4", "#84cc16",
];

export function AddGoalDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const type = form.get("type") as string;
    const emoji = GOAL_TYPES.find((t) => t.value === type)?.emoji ?? "🎯";

    try {
      await createGoal({
        name: form.get("name") as string,
        description: form.get("description") as string || undefined,
        type,
        emoji,
        targetAmount: parseFloat(form.get("targetAmount") as string),
        currentAmount: parseFloat(form.get("currentAmount") as string) || 0,
        targetDate: form.get("targetDate") ? new Date(form.get("targetDate") as string) : undefined,
        isShared: form.get("isShared") === "on",
        color: selectedColor,
      });
      toast.success("Goal created!");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to create goal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" />New Goal</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Goal Name</Label>
            <Input name="name" placeholder="House Down Payment" required />
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select name="type" defaultValue="SAVINGS">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {GOAL_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Target Amount</Label>
              <Input name="targetAmount" type="number" step="0.01" min="1" placeholder="10000" required />
            </div>
            <div className="space-y-1.5">
              <Label>Current Amount</Label>
              <Input name="currentAmount" type="number" step="0.01" min="0" placeholder="0" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Target Date (optional)</Label>
            <Input name="targetDate" type="date" />
          </div>
          <div className="space-y-1.5">
            <Label>Description (optional)</Label>
            <Input name="description" placeholder="Brief description..." />
          </div>
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`h-6 w-6 rounded-full border-2 transition-transform ${selectedColor === color ? "border-white scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isShared" name="isShared" />
            <Label htmlFor="isShared">Shared goal with partner</Label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Goal"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
