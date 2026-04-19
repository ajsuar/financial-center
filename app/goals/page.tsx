import { getGoals } from "@/lib/actions/goals";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { GoalCard } from "./goal-card";
import { AddGoalDialog } from "./add-goal-dialog";
import { Target, CheckCircle2 } from "lucide-react";

export default async function GoalsPage() {
  const goals = await getGoals();
  const active = goals.filter((g) => !g.isCompleted);
  const completed = goals.filter((g) => g.isCompleted);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Goals</h1>
          <p className="text-sm text-slate-500">{active.length} active · {completed.length} completed</p>
        </div>
        <AddGoalDialog />
      </div>

      {active.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {active.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}

      {active.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center text-slate-400">
            <Target className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="text-lg font-medium text-slate-600">No active goals</p>
            <p className="text-sm mt-1">Create your first financial goal to get started</p>
          </CardContent>
        </Card>
      )}

      {completed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Completed Goals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {completed.map((goal) => (
              <Card key={goal.id} className="opacity-70">
                <CardContent className="p-4 flex items-center gap-3">
                  <span className="text-2xl">{goal.emoji}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{goal.name}</p>
                    <p className="text-xs text-emerald-600">
                      {formatCurrency(goal.targetAmount)} · Completed {goal.completedAt ? formatDate(goal.completedAt) : ""}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
