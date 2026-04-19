"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createMonthlyBudget } from "@/lib/actions/budgets";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function CreateBudgetButton({ month, year }: { month: number; year: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCreate() {
    setLoading(true);
    try {
      await createMonthlyBudget(year, month);
      toast.success("Budget created!");
      router.refresh();
    } catch {
      toast.error("Failed to create budget");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleCreate} disabled={loading} size="sm">
      <Plus className="h-4 w-4 mr-1" />{loading ? "Creating..." : "Create Budget"}
    </Button>
  );
}
