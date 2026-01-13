import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles, User, LogOut, LayoutDashboard, Shield, Moon, Sun, CreditCard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navLinks = [
  { href: "#features", label: "Xususiyatlar" },
  { href: "#categories", label: "Kategoriyalar" },
  { href: "#pricing", label: "Narxlar" },
  { href: "#referral", label: "Referral" },
];

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg">
              <Sparkles className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground tracking-tight">
              PromptsHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/prompts"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
            >
              Promtlar
            </Link>
          </nav>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full w-9 h-9"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9 ring-2 ring-border">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                        {getInitials(user.email || "U")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 glass-card p-2" align="end" forceMount>
                  <div className="flex flex-col space-y-1 px-2 py-2">
                    <p className="text-sm font-medium leading-none">{user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {isAdmin ? "Administrator" : "Foydalanuvchi"}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link to="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link to="/payment">
                      <CreditCard className="mr-2 h-4 w-4" />
                      To'lov
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link to="/prompts">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Promtlar
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                        <Link to="/admin">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="rounded-lg cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Chiqish
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="rounded-full">
                    Kirish
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm" className="rounded-full shadow-lg">
                    Boshlash
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full w-9 h-9"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <button
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-foreground" />
              ) : (
                <Menu className="w-5 h-5 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t border-border/50"
            >
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <Link
                  to="/prompts"
                  className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Promtlar
                </Link>
                <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-border/50">
                  {user ? (
                    <>
                      <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start rounded-lg">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Button>
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start rounded-lg">
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Panel
                          </Button>
                        </Link>
                      )}
                      <Button 
                        variant="ghost" 
                        className="justify-start rounded-lg text-destructive hover:text-destructive"
                        onClick={() => {
                          handleSignOut();
                          setIsMenuOpen(false);
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Chiqish
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" className="w-full rounded-lg">
                          Kirish
                        </Button>
                      </Link>
                      <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                        <Button className="w-full rounded-lg">
                          Boshlash
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};
