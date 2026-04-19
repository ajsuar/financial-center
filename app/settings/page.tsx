import { getHousehold } from "@/lib/actions/household";
import { getCategories } from "@/lib/actions/networth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Users, Tag, Download, Database } from "lucide-react";
import { AddMemberForm } from "./add-member-form";
import { EditMemberDialog } from "@/app/couple/edit-member-dialog";

export default async function SettingsPage() {
  const [household, categories] = await Promise.all([
    getHousehold(),
    getCategories(),
  ]);

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Settings
        </h1>
        <p className="text-sm text-slate-500">Manage your household and preferences</p>
      </div>

      {/* Household */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-500" />
            Household Members
          </CardTitle>
          <CardDescription>Manage who has access to your financial center</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {household?.members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
                  style={{ backgroundColor: member.color + "22" }}
                >
                  {member.emoji}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{member.name}</p>
                  <p className="text-xs text-slate-400">Member since {new Date(member.createdAt).getFullYear()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {member.isDefault && <Badge variant="secondary">Primary</Badge>}
                <EditMemberDialog member={member} />
              </div>
            </div>
          ))}
          <AddMemberForm householdId={household?.id ?? "default-household"} />
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="h-4 w-4 text-amber-500" />
            Categories
          </CardTitle>
          <CardDescription>Transaction categories ({categories.length} total)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Expense Categories</p>
              <div className="flex flex-wrap gap-2">
                {categories.filter((c) => c.type === "EXPENSE").map((cat) => (
                  <span
                    key={cat.id}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
                    style={{ borderLeft: `3px solid ${cat.color}` }}
                  >
                    {cat.icon} {cat.name}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Income Categories</p>
              <div className="flex flex-wrap gap-2">
                {categories.filter((c) => c.type === "INCOME").map((cat) => (
                  <span
                    key={cat.id}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
                    style={{ borderLeft: `3px solid ${cat.color}` }}
                  >
                    {cat.icon} {cat.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-500" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div>
              <p className="text-sm font-medium text-slate-900">Export Data</p>
              <p className="text-xs text-slate-400">Download all your financial data as JSON</p>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1.5" />Export
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div>
              <p className="text-sm font-medium text-slate-900">Database</p>
              <p className="text-xs text-slate-400">SQLite file: ./dev.db (local only)</p>
            </div>
            <Badge variant="success">Local & Private</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <p className="text-xs text-slate-400 text-center">
            Financial Center v1.0 · Built with Next.js + Prisma + SQLite ·{" "}
            <span className="text-emerald-600">All data stays on your device</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
