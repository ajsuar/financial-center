"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { upsertBudgetLine } from "@/lib/actions/budgets";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { Category, BudgetLine } from "@prisma/client";

interface Props {
  budgetId: string;
  categories: Category[];
  existingLines: (BudgetLine & { category: Category })[];
}

export function BudgetLineManager({ budgetId, categories, existingLines }: Props) {
  const [adding, setAdding] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const existingCategoryIds = new Set(existingLines.map((l) => l.categoryId));
  const availableCategories = categories.filter((c) => !existingCategoryIds.has(c.id));

  async function handleAdd() {
    if (!categoryId || !amount) return;
    setLoading(true);
    try {
      await upsertBudgetLine(budgetId, categoryId, parseFloat(amount));
      toast.success("Budget line added!");
      setAdding(false);
      setCategoryId("");
      setAmount("");
      router.refresh();
    } catch {
      toast.error("Failed to add budget line");
    } finally {
      setLoading(false);
    }
  }

  if (availableCategories.length === 0) return null;

  return (
    <div>
      {!adding ? (
        <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4 mr-1" />Add Budget Category
        </Button>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <p className="text-xs text-zinc-400 mb-1.5">Category</p>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-32">
                <p className="text-xs text-zinc-400 mb-1.5">Budget Amount</p>
                <Input
                  type="number"
                  placeholder="500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <Button onClick={handleAdd} disabled={loading || !categoryId || !amount}>
                {loading ? "Adding..." : "Add"}
              </Button>
              <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
