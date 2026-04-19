"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateMember, deleteMember } from "@/lib/actions/members";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const EMOJIS = ["👤", "👨", "👩", "🧑", "👦", "👧", "🧔", "👱", "🦸", "🧙"];
const COLORS = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#ef4444", "#06b6d4"];

interface Props {
  member: { id: string; name: string; emoji: string; color: string; isDefault: boolean };
}

export function EditMemberDialog({ member }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState(member.emoji);
  const [selectedColor, setSelectedColor] = useState(member.color);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await updateMember(member.id, {
        name: form.get("name") as string,
        emoji: selectedEmoji,
        color: selectedColor,
      });
      toast.success("Member updated!");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to update member");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (member.isDefault) { toast.error("Cannot remove primary member"); return; }
    if (!confirm(`Remove ${member.name} from household?`)) return;
    setDeleting(true);
    try {
      await deleteMember(member.id);
      toast.success("Member removed");
      router.refresh();
    } catch {
      toast.error("Failed to remove member");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-60 hover:opacity-100">
          <Pencil className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input name="name" defaultValue={member.name} required />
          </div>
          <div className="space-y-1.5">
            <Label>Avatar</Label>
            <div className="flex gap-2 flex-wrap">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setSelectedEmoji(e)}
                  className={`text-xl p-1.5 rounded-lg border-2 transition-colors ${selectedEmoji === e ? "border-indigo-500 bg-indigo-50" : "border-transparent hover:border-slate-200"}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`h-6 w-6 rounded-full border-2 transition-transform ${selectedColor === c ? "border-slate-900 scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-between pt-2">
            {!member.isDefault && (
              <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                <Trash2 className="h-3.5 w-3.5 mr-1" />{deleting ? "Removing..." : "Remove"}
              </Button>
            )}
            <div className={`flex gap-2 ${member.isDefault ? "ml-auto" : ""}`}>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
