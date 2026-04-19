"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createSubscription, updateSubscription, deleteSubscription } from "@/lib/actions/subscriptions";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const FREQUENCIES = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "ANNUALLY", label: "Annual" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "BIWEEKLY", label: "Biweekly" },
];

export function AddSubscriptionDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [frequency, setFrequency] = useState("MONTHLY");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await createSubscription({
        name: form.get("name") as string,
        amount: parseFloat(form.get("amount") as string),
        frequency,
        provider: (form.get("provider") as string) || undefined,
        nextDue: new Date(form.get("nextDue") as string),
      });
      toast.success("Subscription added!");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to add subscription");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Subscription</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Subscription</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input name="name" placeholder="Netflix" required />
            </div>
            <div className="space-y-1.5">
              <Label>Provider (optional)</Label>
              <Input name="provider" placeholder="Netflix Inc." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Amount</Label>
              <Input name="amount" type="number" step="0.01" min="0" placeholder="15.99" required />
            </div>
            <div className="space-y-1.5">
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Next Due Date</Label>
            <Input name="nextDue" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface EditProps {
  sub: {
    id: string;
    name: string;
    amount: number;
    frequency: string;
    provider: string | null;
    nextDue: Date | string;
  };
}

export function EditSubscriptionDialog({ sub }: EditProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [frequency, setFrequency] = useState(sub.frequency);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await updateSubscription(sub.id, {
        name: form.get("name") as string,
        amount: parseFloat(form.get("amount") as string),
        frequency,
        provider: (form.get("provider") as string) || undefined,
        nextDue: new Date(form.get("nextDue") as string),
      });
      toast.success("Subscription updated!");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to update subscription");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Cancel "${sub.name}"?`)) return;
    setDeleting(true);
    try {
      await deleteSubscription(sub.id);
      toast.success("Subscription cancelled");
      router.refresh();
    } catch {
      toast.error("Failed to cancel subscription");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Subscription</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input name="name" defaultValue={sub.name} required />
            </div>
            <div className="space-y-1.5">
              <Label>Provider (optional)</Label>
              <Input name="provider" defaultValue={sub.provider ?? ""} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Amount</Label>
              <Input name="amount" type="number" step="0.01" defaultValue={sub.amount} required />
            </div>
            <div className="space-y-1.5">
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Next Due Date</Label>
            <Input
              name="nextDue"
              type="date"
              defaultValue={new Date(sub.nextDue).toISOString().slice(0, 10)}
              required
            />
          </div>
          <div className="flex justify-between pt-2">
            <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
              <Trash2 className="h-3.5 w-3.5 mr-1" />{deleting ? "Cancelling..." : "Cancel Sub"}
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Close</Button>
              <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
