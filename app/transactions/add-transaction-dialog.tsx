"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createTransaction } from "@/lib/actions/transactions";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { Account, Category } from "@prisma/client";

interface Props {
  accounts: Account[];
  categories: Category[];
}

export function AddTransactionDialog({ accounts, categories }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await createTransaction({
        accountId: form.get("accountId") as string,
        categoryId: form.get("categoryId") as string || undefined,
        date: new Date(form.get("date") as string),
        description: form.get("description") as string,
        amount: parseFloat(form.get("amount") as string),
        type,
        notes: form.get("notes") as string || undefined,
      });
      toast.success("Transaction added!");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to add transaction");
    } finally {
      setLoading(false);
    }
  }

  const filteredCategories = categories.filter((c) =>
    type === "INCOME" ? c.type === "INCOME" : c.type === "EXPENSE"
  );

  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Transaction</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={type === "EXPENSE" ? "destructive" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setType("EXPENSE")}
            >
              Expense
            </Button>
            <Button
              type="button"
              variant={type === "INCOME" ? "success" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setType("INCOME")}
            >
              Income
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input name="description" placeholder="What was this for?" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Amount</Label>
              <Input name="amount" type="number" step="0.01" min="0.01" placeholder="0.00" required />
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input name="date" type="date" defaultValue={today} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Account</Label>
            <Select name="accountId" required>
              <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Category (optional)</Label>
            <Select name="categoryId">
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {filteredCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Input name="notes" placeholder="Any additional notes..." />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Transaction"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
