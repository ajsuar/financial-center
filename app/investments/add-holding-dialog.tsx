"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createHolding } from "@/lib/actions/investments";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const ASSET_CLASSES = [
  { value: "US_STOCK", label: "US Stocks" },
  { value: "INTL_STOCK", label: "International" },
  { value: "BOND", label: "Bonds" },
  { value: "REAL_ESTATE", label: "Real Estate" },
  { value: "CASH", label: "Cash" },
  { value: "CRYPTO", label: "Crypto" },
  { value: "COMMODITY", label: "Commodities" },
  { value: "OTHER", label: "Other" },
];

interface Props {
  accounts: Array<{ id: string; name: string }>;
}

export function AddHoldingDialog({ accounts }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assetClass, setAssetClass] = useState("US_STOCK");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const quantity = parseFloat(form.get("quantity") as string);
    const currentPrice = parseFloat(form.get("currentPrice") as string);

    try {
      await createHolding({
        accountId,
        name: form.get("name") as string,
        ticker: (form.get("ticker") as string) || undefined,
        assetClass,
        quantity,
        costBasis: parseFloat(form.get("costBasis") as string),
        currentPrice,
        currentValue: quantity * currentPrice,
      });
      toast.success("Holding added — net worth updated!");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to add holding");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Holding</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Investment Holding</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {accounts.length > 1 && (
            <div className="space-y-1.5">
              <Label>Account</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input name="name" placeholder="Vanguard S&P 500" required />
            </div>
            <div className="space-y-1.5">
              <Label>Ticker (optional)</Label>
              <Input name="ticker" placeholder="VOO" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Asset Class</Label>
            <Select value={assetClass} onValueChange={setAssetClass}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ASSET_CLASSES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Shares</Label>
              <Input name="quantity" type="number" step="0.001" min="0" placeholder="10" required />
            </div>
            <div className="space-y-1.5">
              <Label>Cost Basis $</Label>
              <Input name="costBasis" type="number" step="0.01" min="0" placeholder="5000" required />
            </div>
            <div className="space-y-1.5">
              <Label>Current Price</Label>
              <Input name="currentPrice" type="number" step="0.01" min="0" placeholder="510" required />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Holding"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
