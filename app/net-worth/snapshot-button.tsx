"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { takeNetWorthSnapshot } from "@/lib/actions/accounts";
import { Camera } from "lucide-react";
import { toast } from "sonner";

export function SnapshotButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSnapshot() {
    setLoading(true);
    try {
      await takeNetWorthSnapshot();
      toast.success("Snapshot saved!");
      router.refresh();
    } catch {
      toast.error("Failed to save snapshot");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleSnapshot} disabled={loading} variant="outline" size="sm">
      <Camera className="h-4 w-4 mr-1.5" />
      {loading ? "Saving..." : "Take Snapshot"}
    </Button>
  );
}
