import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RefreshCw, AlertTriangle } from "lucide-react";

async function getSubscriptions() {
  return prisma.recurringRule.findMany({
    where: {
      household: { id: "default-household" },
      isSubscription: true,
      isActive: true,
    },
    orderBy: { amount: "desc" },
  });
}

export default async function SubscriptionsPage() {
  const subscriptions = await getSubscriptions();

  const monthlyTotal = subscriptions.reduce((s, sub) => {
    if (sub.frequency === "ANNUALLY") return s + sub.amount / 12;
    if (sub.frequency === "QUARTERLY") return s + sub.amount / 3;
    if (sub.frequency === "WEEKLY") return s + sub.amount * 4.33;
    return s + sub.amount;
  }, 0);

  const annualTotal = monthlyTotal * 12;

  const today = new Date();
  const upcomingThisWeek = subscriptions.filter((s) => {
    const due = new Date(s.nextDue);
    const diff = (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });

  const FREQ_LABELS: Record<string, string> = {
    MONTHLY: "Monthly",
    ANNUALLY: "Annual",
    QUARTERLY: "Quarterly",
    WEEKLY: "Weekly",
    BIWEEKLY: "Biweekly",
    DAILY: "Daily",
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Subscriptions</h1>
        <p className="text-sm text-zinc-400">Recurring expenses and subscription audit</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-zinc-400 mb-1">Monthly Cost</p>
            <p className="text-2xl font-bold text-zinc-100">{formatCurrency(monthlyTotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-zinc-400 mb-1">Annual Cost</p>
            <p className="text-2xl font-bold text-amber-400">{formatCurrency(annualTotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-zinc-400 mb-1">Total Subscriptions</p>
            <p className="text-2xl font-bold text-zinc-100">{subscriptions.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming this week */}
      {upcomingThisWeek.length > 0 && (
        <Card className="border-amber-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              Upcoming This Week
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingThisWeek.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between">
                <span className="text-sm text-zinc-200">{sub.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500">{formatDate(sub.nextDue)}</span>
                  <span className="text-sm font-medium text-amber-400">{formatCurrency(sub.amount)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Subscription list */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-zinc-800">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-lg">
                  {sub.provider ? sub.provider[0] : "📦"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-100">{sub.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {sub.provider && <span className="text-xs text-zinc-500">{sub.provider}</span>}
                    <Badge variant="secondary" className="text-xs">{FREQ_LABELS[sub.frequency]}</Badge>
                    <span className="text-xs text-zinc-600">Next: {formatDate(sub.nextDue)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-zinc-100">{formatCurrency(sub.amount)}</p>
                  <p className="text-xs text-zinc-500">
                    {formatCurrency(sub.amount * (sub.frequency === "ANNUALLY" ? 1/12 : sub.frequency === "MONTHLY" ? 1 : 1))}/mo
                  </p>
                </div>
              </div>
            ))}
            {subscriptions.length === 0 && (
              <div className="py-16 text-center text-zinc-500">
                <RefreshCw className="h-12 w-12 mx-auto mb-3 text-zinc-700" />
                <p>No subscriptions tracked</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
