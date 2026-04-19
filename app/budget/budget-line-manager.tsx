"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { upsertBudgetLine, deleteBudgetLine } from "@/lib/actions/budgets";
import { Plus, Trash2, Check, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const router = useRouter();

  const existingCategoryIds = new Set(existingLines.map((l) => l.categoryId));
  const availableCategories = categories.filter((c) => !existingCategoryIds.has(c.id));

  async function handleAdd() {
    if (!categoryId || !amount) return;
    setLoading(true);
    try {
      await upsertBudgetLine(budgetId, categoryId, parseFloat(amount));
      toast.success("Budget category added!");
      setAdding(false);
      setCategoryId("");
      setAmount("");
      router.refresh();
    } catch {
      toast.error("Failed to add budget category");
    } finally {
      setLoading(false);
    }
  }

  async function handleEditSave(line: BudgetLine & { category: Category }) {
    const val = parseFloat(editAmount);
    if (!val || val <= 0) return;
    try {
      await upsertBudgetLine(budgetId, line.categoryId, val);
      toast.success("Budget updated!");
      setEditingId(null);
      router.refresh();
    } catch {
      toast.error("Failed to update budget");
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remove "${name}" from budget?`)) return;
    try {
      await deleteBudgetLine(id);
      toast.success("Removed from budget");
      router.refresh();
    } catch {
      toast.error("Failed to remove");
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Manage Budget Lines</h2>
        {availableCategories.length > 0 && !adding && (
          <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4 mr-1" />Add Category
          </Button>
        )}
      </div>

      {/* Existing lines — editable */}
      {existingLines.length > 0 && (
        <Card>
          <CardContent className="p-0 divide-y divide-slate-100">
            {existingLines.map((line) => (
              <div key={line.id} className="flex items-center gap-3 px-4 py-3">
                <span className="text-base">{line.category.icon}</span>
                <span className="text-sm text-slate-700 flex-1">{line.category.name}</span>
                {editingId === line.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="h-7 w-24 text-xs"
                      autoFocus
                    />
                    <Button size="icon" className="h-7 w-7" onClick={() => handleEditSave(line)}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingId(null)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setEditingId(line.id); setEditAmount(String(line.allocated)); }}
                      className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
                    >
                      {formatCurrency(line.allocated)}
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-slate-300 hover:text-red-500"
                      onClick={() => handleDelete(line.id, line.category.name)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Add new line */}
      {adding && (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <p className="text-xs text-slate-500 mb-1.5">Category</p>
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
                <p className="text-xs text-slate-500 mb-1.5">Budget Amount</p>
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
