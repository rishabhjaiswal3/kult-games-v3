import { Link } from "react-router-dom";
import { Box, Home, ShoppingCart, Swords } from "lucide-react";

export function QuickActions() {
  const actions = [
    { label: "Create Agent", icon: Box, color: "#9b4dff", href: "/ai-arena" },
    { label: "Train Agent", icon: Home, color: "#0089ff", href: "/ai-arena" },
    { label: "Find Battle", icon: Swords, color: "#ffc000", href: "/ai-arena" },
    { label: "Inventory", icon: ShoppingCart, color: "#00e68a", href: "/inventory" },
  ];

  return (
    <section className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#04080f]/60 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-300 hover:border-[#8b29ff]/20">
      <h3 className="font-tech text-xs font-bold uppercase tracking-wider text-white drop-shadow-sm">Quick Actions</h3>
      <div className="mt-5 grid grid-cols-4 gap-2 sm:gap-3">
        {actions.map((action) => (
          <Link
            to={action.href}
            key={action.label}
            className="relative flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border border-white/5 bg-[#0a0f1b]/50 p-2 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-[#111626]/80 hover:shadow-[0_8px_20px_rgba(255,255,255,0.05)]"
          >
            <action.icon
              className="h-7 w-7 sm:h-8 sm:w-8 transition-transform duration-300 group-hover:scale-110"
              style={{ color: action.color, filter: `drop-shadow(0 0 8px ${action.color}66)` }}
            />
            <span className="font-tech text-[8px] sm:text-[9px] font-bold uppercase tracking-wide text-white/70">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
