import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Download, ChevronLeft, ChevronRight, Bell } from "lucide-react";
import ReminderStatsWidget from "@/components/admin/ReminderStatsWidget";

const PAGE_SIZE = 50;

interface ReminderRow {
  email: string;
  full_name: string;
  subscription_type: string;
  reminder_type: string;
  expires_at: string | null;
  sent_at: string;
  days_until_expiry: number | null;
}

const reminderTypeColors: Record<string, string> = {
  "7_days": "bg-blue-500/10 text-blue-700 border-blue-200",
  "3_days": "bg-amber-500/10 text-amber-700 border-amber-200",
  "1_day": "bg-orange-500/10 text-orange-700 border-orange-200",
  expired: "bg-destructive/10 text-destructive border-destructive/20",
};

const AdminReminders = () => {
  const [rows, setRows] = useState<ReminderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSubType, setFilterSubType] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    let query = supabase
      .from("subscription_reminders")
      .select(
        `id, reminder_type, subscription_type, expires_at, sent_at, profiles!subscription_reminders_profile_id_fkey(email, full_name)`,
        { count: "exact" }
      )
      .order("sent_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (filterType !== "all") query = query.eq("reminder_type", filterType);
    if (filterSubType !== "all") query = query.eq("subscription_type", filterSubType);
    if (dateFrom) query = query.gte("sent_at", dateFrom);
    if (dateTo) query = query.lte("sent_at", dateTo + "T23:59:59");

    const { data, count, error } = await query;

    if (!error && data) {
      const mapped: ReminderRow[] = data.map((r: any) => ({
        email: r.profiles?.email || "",
        full_name: r.profiles?.full_name || "",
        subscription_type: r.subscription_type,
        reminder_type: r.reminder_type,
        expires_at: r.expires_at,
        sent_at: r.sent_at,
        days_until_expiry: r.expires_at
          ? Math.round(
              (new Date(r.expires_at).getTime() - new Date(r.sent_at).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : null,
      }));
      setRows(mapped);
      setTotal(count || 0);
    }
    setIsLoading(false);
  }, [page, filterType, filterSubType, dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(0);
  }, [filterType, filterSubType, dateFrom, dateTo]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleExportCSV = async () => {
    let query = supabase
      .from("subscription_reminders")
      .select(
        `reminder_type, subscription_type, expires_at, sent_at, profiles!subscription_reminders_profile_id_fkey(email, full_name)`
      )
      .order("sent_at", { ascending: false })
      .range(0, 9999);

    if (filterType !== "all") query = query.eq("reminder_type", filterType);
    if (filterSubType !== "all") query = query.eq("subscription_type", filterSubType);
    if (dateFrom) query = query.gte("sent_at", dateFrom);
    if (dateTo) query = query.lte("sent_at", dateTo + "T23:59:59");

    const { data } = await query;
    if (!data || data.length === 0) return;

    const csvRows = [
      "Email,Ism,Obuna turi,Eslatma turi,Tugash sanasi,Yuborilgan sana",
      ...data.map((r: any) =>
        [
          r.profiles?.email || "",
          r.profiles?.full_name || "",
          r.subscription_type,
          r.reminder_type,
          r.expires_at ? new Date(r.expires_at).toLocaleDateString("uz-UZ") : "",
          new Date(r.sent_at).toLocaleDateString("uz-UZ"),
        ].join(",")
      ),
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eslatmalar_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">
          Obuna eslatmalari
        </h1>
        <p className="text-muted-foreground text-sm">
          Yuborilgan eslatmalar tarixi va statistikasi
        </p>
      </div>

      {/* Stats Widget */}
      <div className="bg-card rounded-xl border border-border p-5">
        <ReminderStatsWidget />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Eslatma turi</label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barchasi</SelectItem>
              <SelectItem value="7_days">7 kunlik</SelectItem>
              <SelectItem value="3_days">3 kunlik</SelectItem>
              <SelectItem value="1_day">1 kunlik</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Obuna turi</label>
          <Select value={filterSubType} onValueChange={setFilterSubType}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barchasi</SelectItem>
              <SelectItem value="monthly">Oylik</SelectItem>
              <SelectItem value="yearly">Yillik</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Dan</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-[150px]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Gacha</label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-[150px]"
          />
        </div>

        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-1" />
          CSV export
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Foydalanuvchi</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Obuna</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Eslatma</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Tugash sanasi</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Yuborilgan</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Kunlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Eslatmalar topilmadi
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <p className="font-medium text-foreground">{row.full_name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{row.email}</p>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-xs capitalize">
                        {row.subscription_type}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant="outline"
                        className={`text-xs ${reminderTypeColors[row.reminder_type] || ""}`}
                      >
                        {row.reminder_type}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {row.expires_at
                        ? new Date(row.expires_at).toLocaleDateString("uz-UZ")
                        : "—"}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {new Date(row.sent_at).toLocaleDateString("uz-UZ")}
                    </td>
                    <td className="p-3">
                      {row.days_until_expiry !== null ? (
                        <span
                          className={
                            row.days_until_expiry <= 0
                              ? "text-destructive font-medium"
                              : row.days_until_expiry <= 1
                              ? "text-orange-600 font-medium"
                              : "text-muted-foreground"
                          }
                        >
                          {row.days_until_expiry}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Jami: {total} ta — Sahifa {page + 1}/{totalPages}
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReminders;
