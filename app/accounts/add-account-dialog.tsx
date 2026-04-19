"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAccount } from "@/lib/actions/accounts";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const ACCOUNT_TYPES = [
  { value: "CHECKING", label: "Checking" },
  { value: "SAVINGS", label: "Savings" },
  { value: "INVESTMENT", label: "Investment" },
  { value: "CREDIT", label: "Credit Card" },
  { value: "LOAN", label: "Loan" },
  { value: "MORTGAGE", label: "Mortgage" },
  { value: "CASH", label: "Cash" },
  { value: "OTHER_ASSET", label: "Other Asset" },
  { value: "OTHER_LIABILITY", label: "Other Liability" },
];

export function AddAccountDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await createAccount({
        name: form.get("name") as string,
        type: form.get("type") as string,
        institution: form.get("institution") as string || undefined,
        balance: parseFloat(form.get("balance") as string) || 0,
        isShared: form.get("isShared") === "on",
        notes: form.get("notes") as string || undefined,
      });
      toast.success("Account created!");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Account</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Account Name</Label>
            <Input id="name" name="name" placeholder="Chase Checking" required />
          </div>
          <div className="space-y-1.5">
            <Label>Account Type</Label>
            <Select name="type" required>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="institution">Institution (optional)</Label>
            <Input id="institution" name="institution" placeholder="Chase, Fidelity..." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="balance">Current Balance</Label>
            <Input id="balance" name="balance" type="number" step="0.01" placeholder="0.00" required />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isShared" name="isShared" className="rounded" />
            <Label htmlFor="isShared">Shared account (joint with partner)</Label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Account"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
