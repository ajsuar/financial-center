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
import type { Account } from "@prisma/client";

export function EditAccountDialog({ account }: { account: Account }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await updateAccount(account.id, {
        name: form.get("name") as string,
        balance: parseFloat(form.get("balance") as string),
        institution: form.get("institution") as string || undefined,
        notes: form.get("notes") as string || undefined,
      });
      toast.success("Account updated!");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to update account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Account Name</Label>
            <Input id="name" name="name" defaultValue={account.name} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="institution">Institution</Label>
            <Input id="institution" name="institution" defaultValue={account.institution ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="balance">Current Balance</Label>
            <Input id="balance" name="balance" type="number" step="0.01" defaultValue={account.balance} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" name="notes" defaultValue={account.notes ?? ""} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
