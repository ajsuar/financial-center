"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateAccount } from "@/lib/actions/accounts";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

interface Props {
  account: { id: string; name: string; balance: number };
}

export function EditBalanceDialog({ account }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const balance = parseFloat(form.get("balance") as string);
    try {
      await updateAccount(account.id, { balance });
      toast.success("Balance updated — net worth recalculated!");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to update balance");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-50 hover:opacity-100">
          <Pencil className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Update Balance — {account.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Current Balance</Label>
            <Input name="balance" type="number" step="0.01" defaultValue={account.balance} required />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Update"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
