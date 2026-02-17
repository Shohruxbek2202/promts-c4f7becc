import { useEffect, useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, FileText, Users, CreditCard, Settings,
  LogOut, Sparkles, ChevronRight, FolderOpen, GraduationCap,
  PlayCircle, Menu, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/admin/courses", icon: GraduationCap, label: "Kurslar" },
  { href: "/admin/prompts", icon: FileText, label: "Promtlar" },
  { href: "/admin/lessons", icon: PlayCircle, label: "Darslar" },
  { href: "/admin/categories", icon: FolderOpen, label: "Kategoriyalar" },
  { href: "/admin/pricing", icon: CreditCard, label: "Tariflar" },
  { href: "/admin/payment-methods", icon: CreditCard, label: "To'lov usullari" },
  { href: "/admin/users", icon: Users, label: "Foydalanuvchilar" },
  { href: "/admin/payments", icon: CreditCard, label: "To'lovlar" },
  { href: "/admin/settings", icon: Settings, label: "Sozlamalar" },
];

const AdminLayout = () => {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      toast.error("Admin paneliga kirish taqiqlangan");
      navigate("/");
    }
  }, [user, isAdmin, isLoading, navigate]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">Yuklanmoqda...</div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const NavContent = () => (
    <>
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold text-foreground">Admin Panel</span>
        </Link>
      </div>
      <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.exact ? location.pathname === item.href : location.pathname.startsWith(item.href);
          return (
            <Link key={item.href} to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground" onClick={handleSignOut}>
          <LogOut className="w-5 h-5" /> Chiqish
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-40 flex-col">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 h-14 bg-card border-b border-border flex items-center justify-between px-4">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 flex flex-col">
            <NavContent />
          </SheetContent>
        </Sheet>
        <span className="font-display font-bold text-foreground">Admin Panel</span>
        <span className="text-xs text-muted-foreground truncate max-w-[120px]">{user.email}</span>
      </header>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 bg-card border-b border-border items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Bosh sahifa</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Admin Panel</span>
          </div>
          <span className="text-sm text-muted-foreground">{user.email}</span>
        </header>

        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
