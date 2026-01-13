import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
  Layers,
  FolderOpen,
  ChevronRight,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "expert";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

interface Prompt {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  difficulty: DifficultyLevel;
  is_premium: boolean;
  is_published: boolean;
  is_agency_only: boolean;
  view_count: number;
  created_at: string;
  category_id: string | null;
  categories?: Category;
}

const difficultyLabels: Record<DifficultyLevel, string> = {
  beginner: "Boshlang'ich",
  intermediate: "O'rta",
  advanced: "Ilg'or",
  expert: "Ekspert",
};

const difficultyColors: Record<DifficultyLevel, string> = {
  beginner: "bg-green-500/10 text-green-600 dark:text-green-400",
  intermediate: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  advanced: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  expert: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const AdminPrompts = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [promptCounts, setPromptCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchPrompts();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("id, name, slug, icon")
      .order("sort_order");
    
    if (data) {
      setCategories(data);
      
      // Fetch prompt counts
      const counts: Record<string, number> = {};
      for (const cat of data) {
        const { count } = await supabase
          .from("prompts")
          .select("id", { count: "exact", head: true })
          .eq("category_id", cat.id);
        counts[cat.id] = count || 0;
      }
      setPromptCounts(counts);
    }
  };

  const fetchPrompts = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("prompts")
      .select(`
        id, title, slug, description, difficulty, is_premium, is_published, is_agency_only, view_count, created_at, category_id,
        categories (id, name, slug, icon)
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
      fetchCategories();
      if (selectedPrompt?.id === id) {
        setSelectedPrompt(null);
      }
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

  const isEmoji = (str: string) => {
    const emojiRegex = /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]$/u;
    return emojiRegex.test(str) || str.length <= 2;
  };

  const renderIcon = (icon: string | null) => {
    if (icon && isEmoji(icon)) {
      return <span className="text-base">{icon}</span>;
    }
    return <FolderOpen className="w-4 h-4 text-amber-500" />;
  };

  // Filter prompts based on search and category
  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || prompt.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate total prompts count
  const totalPromptsCount = prompts.length;

  // Get current category name
  const currentCategoryName = selectedCategory 
    ? categories.find(c => c.id === selectedCategory)?.name || "Kategoriya"
    : "Barcha promtlar";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Promtlar</h1>
          <p className="text-muted-foreground">
            Barcha promtlarni boshqaring
          </p>
        </div>
        <Link to="/admin/prompts/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
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

      {/* Apple Notes Style Layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden shadow-2xl"
      >
        <div className="flex min-h-[60vh]">
          {/* Left Sidebar - Categories */}
          <div className="w-64 border-r border-border/50 bg-card/50 flex flex-col">
            {/* Sidebar Header with window controls */}
            <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>

            {/* Label */}
            <div className="px-4 py-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Kategoriyalar ({categories.length})
              </span>
            </div>

            {/* Categories List */}
            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-400px)]">
              {/* All Prompts */}
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setSelectedPrompt(null);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                  !selectedCategory 
                    ? "bg-primary/20 text-primary" 
                    : "hover:bg-muted/50 text-foreground"
                }`}
              >
                <Layers className="w-4 h-4 text-primary" />
                <span className="flex-1 text-left text-sm font-medium truncate">
                  Barchasi
                </span>
                <span className="text-xs text-muted-foreground">
                  {totalPromptsCount}
                </span>
              </button>

              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setSelectedPrompt(null);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                    selectedCategory === category.id 
                      ? "bg-primary/20 text-primary" 
                      : "hover:bg-muted/50 text-foreground"
                  }`}
                >
                  {renderIcon(category.icon)}
                  <span className="flex-1 text-left text-sm font-medium truncate">
                    {category.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {promptCounts[category.id] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Middle - Prompts List */}
          <div className="w-80 border-r border-border/50 flex flex-col">
            {/* Content Header */}
            <div className="px-4 py-3 border-b border-border/50">
              <h2 className="font-semibold text-foreground">
                {currentCategoryName}
              </h2>
              <p className="text-xs text-muted-foreground">
                {filteredPrompts.length} ta promt
              </p>
            </div>

            {/* Prompts List */}
            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-400px)]">
              {isLoading ? (
                <div className="p-4 space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted/50 rounded animate-pulse" />
                  ))}
                </div>
              ) : filteredPrompts.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Promtlar topilmadi</p>
                </div>
              ) : (
                filteredPrompts.map((prompt) => (
                  <button
                    key={prompt.id}
                    onClick={() => setSelectedPrompt(prompt)}
                    className={`w-full text-left p-4 border-b border-border/30 transition-colors ${
                      selectedPrompt?.id === prompt.id 
                        ? "bg-primary/10" 
                        : "hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-medium text-foreground text-sm line-clamp-1">
                        {prompt.title}
                      </h3>
                      {prompt.is_premium && (
                        <Lock className="w-3 h-3 text-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                      {prompt.description || "Tavsif yo'q"}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge className={`${difficultyColors[prompt.difficulty]} text-[10px] px-1.5 py-0`}>
                        {difficultyLabels[prompt.difficulty]}
                      </Badge>
                      {!prompt.is_published && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          Yashirin
                        </Badge>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right - Prompt Details */}
          <div className="flex-1 flex flex-col">
            {selectedPrompt ? (
              <>
                {/* Detail Header */}
                <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      {selectedPrompt.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedPrompt.categories?.name || "Kategoriyasiz"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/prompt/${selectedPrompt.slug}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        Ko'rish
                      </Button>
                    </Link>
                    <Link to={`/admin/prompts/${selectedPrompt.id}/edit`}>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-1" />
                        Tahrirlash
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(selectedPrompt.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      O'chirish
                    </Button>
                  </div>
                </div>

                {/* Detail Content */}
                <div className="flex-1 overflow-y-auto p-6 max-h-[calc(100vh-400px)]">
                  {/* Status Card */}
                  <div className="p-4 bg-muted/30 rounded-xl mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={selectedPrompt.is_published}
                            onCheckedChange={() => togglePublished(selectedPrompt.id, selectedPrompt.is_published)}
                          />
                          <span className="text-sm">
                            {selectedPrompt.is_published ? "Nashr etilgan" : "Yashirin"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Turi</p>
                        <div className="flex gap-2">
                          {selectedPrompt.is_premium && (
                            <Badge className="gap-1">
                              <Lock className="w-3 h-3" />
                              Premium
                            </Badge>
                          )}
                          {selectedPrompt.is_agency_only && (
                            <Badge variant="secondary">Agentlik</Badge>
                          )}
                          {!selectedPrompt.is_premium && !selectedPrompt.is_agency_only && (
                            <Badge variant="outline">Bepul</Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Daraja</p>
                        <Badge className={difficultyColors[selectedPrompt.difficulty]}>
                          {difficultyLabels[selectedPrompt.difficulty]}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Ko'rishlar</p>
                        <span className="text-sm font-medium">{selectedPrompt.view_count}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedPrompt.description && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-foreground mb-2">Tavsif</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedPrompt.description}
                      </p>
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Slug: <span className="font-mono">{selectedPrompt.slug}</span></p>
                    <p>Yaratilgan: {new Date(selectedPrompt.created_at).toLocaleDateString("uz-UZ")}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Promtni tanlang</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminPrompts;
