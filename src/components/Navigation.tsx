import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Sparkles, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/assessment", label: "New Assessment" },
    { to: "/insights", label: "Insights" },
    { to: "/about", label: "About" },
  ];

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "h-16 bg-background/80 shadow-lg backdrop-blur-xl"
          : "h-20 bg-background/60 backdrop-blur-md"
      }`}
    >
      <div className="container mx-auto flex h-full items-center justify-between px-4">
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary to-secondary opacity-20 blur-xl transition-opacity group-hover:opacity-40" />
            <div className="relative rounded-lg bg-gradient-to-br from-primary to-secondary p-2">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          </div>
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-xl font-bold text-transparent font-display">
            Credit Risk Analyzer
          </span>
        </NavLink>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/assessment">
            <Button
              size="sm"
              className="ml-2 bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:scale-105 transition-all"
            >
              Start Assessment
            </Button>
          </NavLink>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted/50"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-xl border-t border-border/50 shadow-xl animate-fade-in">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
