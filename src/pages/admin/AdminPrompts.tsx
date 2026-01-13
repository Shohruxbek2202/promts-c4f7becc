import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Eye,
  Lock,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "expert";

interface Category {
  id: string;
  name: string;
}

interface Prompt {
  id: string;
  title: string;
  slug: string;
  difficulty: DifficultyLevel;
  is_premium: boolean;
  is_published: boolean;
  view_count: number;
  created_at: string;
  categories?: Category;
}

const difficultyLabels: Record<DifficultyLevel, string> = {
  beginner: "Boshlang'ich",
  intermediate: "O'rta",
  advanced: "Ilg'or",
  expert: "Ekspert",
};

const AdminPrompts = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("prompts")
      .select(`
        id, title, slug, difficulty, is_premium, is_published, view_count, created_at,
        categories (id, name)
      `)
      .order("created_at", { ascending: false });

    if (data) setPrompts(data as Prompt[]);
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu promtni o'chirmoqchimisiz?")) return;

    const { error } = await supabase
      .from("prompts")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("O'chirishda xatolik yuz berdi");
    } else {
      toast.success("Promt o'chirildi");
      fetchPrompts();
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("prompts")
      .update({ is_published: !currentStatus })
      .eq("id", id);

    if (!error) {
      toast.success(currentStatus ? "Promt yashirildi" : "Promt nashr etildi");
      fetchPrompts();
    }
  };

  const filteredPrompts = prompts.filter(prompt =>
    prompt.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Promtlar
          </h1>
          <p className="text-muted-foreground">
            Barcha promtlarni boshqaring
          </p>
        </div>
        <Link to="/admin/prompts/new">
          <Button variant="hero">
            <Plus className="w-4 h-4 mr-2" />
            Yangi promt
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Promt qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                  Sarlavha
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                  Kategoriya
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                  Daraja
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                  Ko'rishlar
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                  Sana
                </th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : filteredPrompts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    Promtlar topilmadi
                  </td>
                </tr>
              ) : (
                filteredPrompts.map((prompt) => (
                  <tr key={prompt.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {prompt.title}
                        </span>
                        {prompt.is_premium && (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {prompt.categories?.name || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">
                        {difficultyLabels[prompt.difficulty]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={prompt.is_published ? "default" : "secondary"}>
                        {prompt.is_published ? "Nashr etilgan" : "Yashirin"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {prompt.view_count}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(prompt.created_at).toLocaleDateString("uz-UZ")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/prompt/${prompt.slug}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ko'rish
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/prompts/${prompt.id}/edit`}>
                              <Edit className="w-4 h-4 mr-2" />
                              Tahrirlash
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => togglePublished(prompt.id, prompt.is_published)}
                          >
                            {prompt.is_published ? "Yashirish" : "Nashr etish"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(prompt.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            O'chirish
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPrompts;
