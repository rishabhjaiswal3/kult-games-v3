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
    <section className="arena-panel p-4">
      <h3 className="font-tech text-xs uppercase">Quick Actions</h3>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-4">
        {actions.map((action) => (
          <Link
            to={action.href}
            key={action.label}
            className="grid h-[88px] place-items-center rounded-md border border-white/10 bg-white/[0.02] p-2"
          >
            <action.icon className="h-9 w-9" style={{ color: action.color }} />
            <span className="font-tech text-[9px] uppercase">{action.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
