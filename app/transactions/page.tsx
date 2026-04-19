import { getTransactions } from "@/lib/actions/transactions";
import { getAccounts } from "@/lib/actions/accounts";
import { getCategories } from "@/lib/actions/networth";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AddTransactionDialog } from "./add-transaction-dialog";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; categoryId?: string; accountId?: string; search?: string }>;
}) {
  const params = await searchParams;
  const [transactions, accounts, categories] = await Promise.all([
    getTransactions({
      type: params.type,
      categoryId: params.categoryId,
      accountId: params.accountId,
      search: params.search,
      limit: 100,
    }),
    getAccounts(),
    getCategories(),
  ]);

  const flatCategories = categories.flatMap((c) => [c, ...c.children]);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
          <p className="text-sm text-slate-500">{transactions.length} transactions</p>
        </div>
        <AddTransactionDialog accounts={accounts} categories={flatCategories} />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100">
                  <span className="text-base">{tx.category?.icon ?? (tx.type === "INCOME" ? "💰" : "💸")}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{tx.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-slate-400">{formatDate(tx.date)}</p>
                    {tx.category && (
                      <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {tx.category.name}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">{tx.account.name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${tx.type === "INCOME" ? "text-emerald-600" : "text-red-500"}`}>
                    {tx.type === "INCOME" ? "+" : "-"}{formatCurrency(Math.abs(tx.amount))}
                  </p>
                  {tx.isReviewed && <span className="text-xs text-slate-400">✓</span>}
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="py-16 text-center text-slate-400">
                <p className="text-4xl mb-3">📋</p>
                <p>No transactions found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
