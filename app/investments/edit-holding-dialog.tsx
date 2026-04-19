"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateHolding, deleteHolding } from "@/lib/actions/investments";
import { Pencil, Trash2 } from "lucide-react";
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
  holding: {
    id: string;
    name: string;
    ticker: string | null;
    assetClass: string;
    quantity: number;
    costBasis: number;
    currentPrice: number;
    currentValue: number;
  };
}

export function EditHoldingDialog({ holding }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [assetClass, setAssetClass] = useState(holding.assetClass);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const quantity = parseFloat(form.get("quantity") as string);
    const costBasis = parseFloat(form.get("costBasis") as string);
    const currentPrice = parseFloat(form.get("currentPrice") as string);
    const currentValue = quantity * currentPrice;

    try {
      await updateHolding(holding.id, {
        name: form.get("name") as string,
        ticker: (form.get("ticker") as string) || undefined,
        assetClass,
        quantity,
        costBasis,
        currentPrice,
        currentValue,
      });
      toast.success("Holding updated — net worth synced!");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to update holding");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Remove ${holding.name} from your portfolio?`)) return;
    setDeleting(true);
    try {
      await deleteHolding(holding.id);
      toast.success("Holding removed");
      router.refresh();
    } catch {
      toast.error("Failed to remove holding");
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
          <DialogTitle>Edit Holding</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input name="name" defaultValue={holding.name} required />
            </div>
            <div className="space-y-1.5">
              <Label>Ticker (optional)</Label>
              <Input name="ticker" defaultValue={holding.ticker ?? ""} placeholder="AAPL" />
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
              <Input name="quantity" type="number" step="0.001" defaultValue={holding.quantity} required />
            </div>
            <div className="space-y-1.5">
              <Label>Cost Basis</Label>
              <Input name="costBasis" type="number" step="0.01" defaultValue={holding.costBasis} required />
            </div>
            <div className="space-y-1.5">
              <Label>Current Price</Label>
              <Input name="currentPrice" type="number" step="0.01" defaultValue={holding.currentPrice} required />
            </div>
          </div>
          <p className="text-xs text-slate-500">Current value = shares × current price. Net worth updates automatically.</p>
          <div className="flex justify-between pt-2">
            <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
              <Trash2 className="h-3.5 w-3.5 mr-1" />{deleting ? "Removing..." : "Remove"}
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
