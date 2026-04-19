"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addMember } from "@/lib/actions/members";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function AddMemberForm({ householdId }: { householdId: string }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAdd() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await addMember(householdId, name.trim(), "👤", "#ec4899");
      toast.success("Member added!");
      setAdding(false);
      setName("");
      router.refresh();
    } catch {
      toast.error("Failed to add member");
    } finally {
      setLoading(false);
    }
  }

  if (!adding) {
    return (
      <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
        <Plus className="h-4 w-4 mr-1" />Add Member
      </Button>
    );
  }

  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1">
        <Label className="text-xs mb-1">Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Partner's name"
          autoFocus
        />
      </div>
      <Button onClick={handleAdd} disabled={loading || !name.trim()} size="sm">
        {loading ? "Adding..." : "Add"}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
    </div>
  );
}
