import { getHousehold } from "@/lib/actions/household";
import { getGoals } from "@/lib/actions/goals";
import { getMonthlySummary } from "@/lib/actions/transactions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, getGoalProgress } from "@/lib/utils";
import { Heart, Calendar, ClipboardCheck, Star } from "lucide-react";
import Link from "next/link";

function getCompatibilityScore(
  savingsRate: number,
  goalsCount: number,
  sharedGoalsCount: number
): { score: number; label: string; description: string } {
  let score = 0;
  if (savingsRate >= 20) score += 30;
  else if (savingsRate >= 10) score += 20;
  else if (savingsRate > 0) score += 10;

  if (sharedGoalsCount > 0) score += 30;
  if (goalsCount > 2) score += 20;
  score += 20; // base participation score

  const label =
    score >= 90 ? "Money Goals 💰" :
    score >= 75 ? "Power Couple 💪" :
    score >= 60 ? "In Sync 🤝" :
    score >= 40 ? "Building Together 🏗️" :
    "Getting Started 🌱";

  const description =
    score >= 90 ? "You're absolutely crushing it together!" :
    score >= 75 ? "Strong alignment on finances — keep it up!" :
    score >= 60 ? "Good foundation with room to grow together" :
    score >= 40 ? "You're building healthy money habits as a team" :
    "Every journey starts somewhere — you've got this!";

  return { score, label, description };
}

const CHECK_IN_PROMPTS = [
  { key: "biggest_win", prompt: "What was your biggest financial win this month?" },
  { key: "spending_concern", prompt: "Any spending that felt off-track?" },
  { key: "goal_update", prompt: "How are we tracking on our shared goals?" },
  { key: "next_intention", prompt: "One thing we want to improve next month?" },
];

const MONEY_DATE_AGENDAS = [
  {
    name: "Monthly Review",
    duration: "30 min",
    icon: "📊",
    items: ["Review last month's budget", "Check goal progress", "Review subscriptions", "Celebrate wins!"],
  },
  {
    name: "Quarterly Deep Dive",
    duration: "60 min",
    icon: "🔍",
    items: ["Net worth snapshot", "Investment review", "Insurance & benefits check", "Plan next quarter goals"],
  },
  {
    name: "Annual Planning",
    duration: "2 hours",
    icon: "📅",
    items: ["Year-in-review summary", "Set goals for next year", "Tax preparation review", "Big purchase planning"],
  },
];

export default async function CouplePage() {
  const now = new Date();
  const [household, goals, summary] = await Promise.all([
    getHousehold(),
    getGoals(),
    getMonthlySummary(now.getFullYear(), now.getMonth() + 1),
  ]);

  const sharedGoals = goals.filter((g) => g.isShared && !g.isCompleted);
  const { score, label, description } = getCompatibilityScore(
    summary.savingsRate,
    goals.length,
    sharedGoals.length
  );

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <Heart className="h-6 w-6 text-pink-400" />
          Couple Hub
        </h1>
        <p className="text-sm text-zinc-400">Shared finances, check-ins, and money dates</p>
      </div>

      {/* Compatibility Score */}
      <Card className="border-pink-900/40 bg-gradient-to-br from-zinc-900 to-pink-950/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <p className="text-sm text-zinc-400">Financial Harmony Score</p>
            <div className="relative mx-auto w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#27272a" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="#ec4899" strokeWidth="3"
                  strokeDasharray={`${score} ${100 - score}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-zinc-100">{score}</span>
              </div>
            </div>
            <div>
              <p className="text-xl font-bold text-pink-400">{label}</p>
              <p className="text-sm text-zinc-400 mt-1">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shared Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-400" />
              Shared Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sharedGoals.map((goal) => {
              const pct = getGoalProgress(goal.currentAmount, goal.targetAmount);
              return (
                <div key={goal.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-200 flex items-center gap-1.5">
                      <span>{goal.emoji}</span>
                      {goal.name}
                    </span>
                    <span className="text-xs text-zinc-400">{pct.toFixed(0)}%</span>
                  </div>
                  <Progress value={pct} className="h-1.5" indicatorClassName="bg-pink-500" />
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>{formatCurrency(goal.currentAmount, "USD", true)}</span>
                    <span>{formatCurrency(goal.targetAmount, "USD", true)}</span>
                  </div>
                </div>
              );
            })}
            {sharedGoals.length === 0 && (
              <p className="text-sm text-zinc-500 text-center py-4">
                No shared goals yet. <Link href="/goals" className="text-indigo-400 hover:underline">Create one →</Link>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Check-in Prompts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-blue-400" />
              Monthly Check-in
            </CardTitle>
            <CardDescription>Talk through these prompts together</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {CHECK_IN_PROMPTS.map((p, i) => (
              <div key={p.key} className="flex gap-3 p-3 rounded-lg bg-zinc-800/50">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs font-medium text-zinc-300">
                  {i + 1}
                </span>
                <p className="text-sm text-zinc-200">{p.prompt}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Money Date Agendas */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-emerald-400" /> Money Date Templates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MONEY_DATE_AGENDAS.map((agenda) => (
            <Card key={agenda.name} className="hover:border-zinc-600 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-2xl">{agenda.icon}</span>
                  {agenda.name}
                </CardTitle>
                <Badge variant="secondary" className="w-fit">{agenda.duration}</Badge>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {agenda.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-zinc-300">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Members */}
      {household && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Household Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {household.members.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-xl"
                    style={{ backgroundColor: member.color + "33" }}
                  >
                    {member.emoji}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-100">{member.name}</p>
                    {member.isDefault && <Badge variant="secondary" className="text-xs mt-0.5">Primary</Badge>}
                  </div>
                </div>
              ))}
              <Link
                href="/settings"
                className="flex items-center justify-center h-16 px-4 rounded-lg border border-dashed border-zinc-700 text-sm text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors"
              >
                + Add partner
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
