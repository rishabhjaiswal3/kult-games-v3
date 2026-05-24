import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, X, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import zeroGLogo from "@/assets/0G Logo.png";
import kultLogo from "@/assets/Kult Logo.png";
import dashboardLiveCard from "@/assets/dashboard-live-card.png";
import { APP_NAV_ITEMS, type NavItem } from "@/layout/navConfig";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type AppSidebarProps = {
  activeLabel?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
};

/* ─── Navigation links ─── */
function SidebarNav({
  items,
  activeLabel,
  isCollapsed,
  onNavigate,
}: {
  items: NavItem[];
  activeLabel: string;
  isCollapsed?: boolean;
  onNavigate?: () => void;
}) {
  const location = useLocation();

  return (
    <nav className="sidebar-nav min-h-0 flex-1 space-y-0.5 overflow-y-auto px-3 py-1">
      {items.map((item, idx) => {
        const isActive =
          item.label === activeLabel ||
          (item.path !== "/" && location.pathname.startsWith(item.path));
        return (
          <Link
            key={item.label}
            to={item.path}
            onClick={onNavigate}
            title={isCollapsed ? item.label : undefined}
            className={cn(
              "sidebar-nav-item group relative flex min-h-[42px] py-1.5 items-center rounded-lg text-[11px] font-semibold uppercase tracking-[0.06em] transition-all duration-200 font-tech",
              isCollapsed ? "justify-center px-0" : "gap-3.5 px-4",
              isActive
                ? "sidebar-nav-active bg-gradient-to-r from-[#8f27ff]/20 via-[#8f27ff]/12 to-transparent text-white"
                : "text-white/55 hover:text-white/90 hover:bg-white/[0.04]",
            )}
            style={{ animationDelay: `${idx * 30}ms` }}
          >
            {/* Active indicator bar */}
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-gradient-to-b from-[#c084fc] via-[#9a35ff] to-[#6d28d9] shadow-[0_0_10px_rgba(154,53,255,0.7)]" />
            )}

            {/* Icon container */}
            <span
              className={cn(
                "flex shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                isCollapsed ? "h-10 w-10" : "h-8 w-8",
                isActive
                  ? "bg-[#9a35ff]/20 text-[#c084fc] shadow-[0_0_12px_rgba(154,53,255,0.3)]"
                  : "text-white/45 group-hover:text-white/75 group-hover:bg-white/[0.04]",
              )}
            >
              <item.icon className="h-[18px] w-[18px]" />
            </span>

            {!isCollapsed && (
              item.tag ? (
                <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
                  <span className="truncate w-full">{item.label}</span>
                  <span className="relative flex items-center gap-1 rounded-full border border-[#9b32ff]/40 bg-[#9b32ff]/15 px-1.5 py-[2px] text-[8px] tracking-widest text-[#c89dff]">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#9b32ff]/60" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#b95cff]" />
                    </span>
                    <span className="animate-pulse">{item.tag}</span>
                  </span>
                </div>
              ) : (
                <span className="min-w-0 flex-1">{item.label}</span>
              )
            )}

            {/* Hover glow trail */}
            <span className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-r from-[#9a35ff]/[0.06] to-transparent" />
          </Link>
        );
      })}

      {/* CTA Button */}
      <div className="pt-3 pb-1">
        <Link
          to="/games"
          onClick={onNavigate}
          title={isCollapsed ? "Explore Games" : undefined}
          className={cn(
            "sidebar-cta group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl font-tech tracking-[0.14em] font-bold text-white transition-all duration-300",
            isCollapsed ? "h-10 w-10 mx-auto text-[0px]" : "h-11 text-[10px]"
          )}
        >
          {/* Gradient background */}
          <span className="absolute inset-0 bg-gradient-to-r from-[#7a22e8] via-[#9a35ff] to-[#b854ff] opacity-90 transition-opacity group-hover:opacity-100" />
          {/* Shimmer sweep */}
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          {/* Glow border */}
          <span className="absolute inset-0 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_0_20px_rgba(154,53,255,0.4)]" />
          <span className="relative z-10 flex items-center gap-2">
            {!isCollapsed && "EXPLORE GAMES"}
            <ArrowUpRight className={cn("transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5", isCollapsed ? "h-5 w-5" : "h-3.5 w-3.5")} />
          </span>
        </Link>
      </div>
    </nav>
  );
}

/* ─── Brand header ─── */
function SidebarBrand({
  isCollapsed,
  onToggleCollapse,
}: {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  return (
    <div className={cn("flex items-start", isCollapsed ? "justify-center pt-5 pb-4" : "justify-between px-5 pt-5 pb-4")}>
      {!isCollapsed && (
        <Link to="/" className="group block shrink-0">
          <div className="flex items-center gap-2.5">
            <img src={zeroGLogo} alt="0G" className="h-5 w-auto object-contain transition-all group-hover:drop-shadow-[0_0_8px_rgba(154,53,255,0.5)]" />
            <span className="h-4 w-px bg-gradient-to-b from-transparent via-[#9a35ff]/40 to-transparent" aria-hidden />
            <img src={kultLogo} alt="Kult Games" className="h-5 w-auto object-contain transition-all group-hover:drop-shadow-[0_0_8px_rgba(154,53,255,0.5)]" />
          </div>
          <p className="mt-2.5 font-mono text-[8px] uppercase tracking-[0.32em] text-white/35 transition-colors group-hover:text-white/50">
            Powered by 0G · AI Arena
          </p>
          <div className="mt-3 h-px bg-gradient-to-r from-transparent via-[#9a35ff]/35 to-transparent" />
        </Link>
      )}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className={cn("text-white/50 hover:text-white transition-colors hidden lg:block", isCollapsed && "mt-1")}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>
      )}
    </div>
  );
}

/* ─── Promo card ─── */
function SidebarPromo({ isCollapsed }: { isCollapsed?: boolean }) {
  if (isCollapsed) return null;

  return (
    <div className="shrink-0 p-3">
      <div className="sidebar-promo group relative overflow-hidden rounded-xl border border-white/[0.08]">
        {/* Background image */}
        <img
          src={dashboardLiveCard}
          alt="Kult Games live"
          className="h-[clamp(130px,16vh,180px)] w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050913] via-[#050913]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#9a35ff]/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Text content */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#9b32ff]/70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#b95cff]" />
            </span>
            {/* <span className="font-tech text-[8px] uppercase tracking-[0.2em] text-[#c89dff]">Live on 0G</span> */}
          </div>
          {/* <p className="text-[11px] font-semibold leading-snug text-white/85">
            Play. Compete. Own the moment.
          </p> */}
        </div>

        {/* Top edge glow on hover */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#9a35ff]/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </div>
  );
}

/* ─── Main Sidebar Component ─── */
export function AppSidebar({ activeLabel = "Home", isCollapsed, onToggleCollapse }: AppSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const navItems = APP_NAV_ITEMS.filter((item) => isAuthenticated || !item.requiresAuth);

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    const handleClose = () => setIsOpen(false);
    window.addEventListener("toggle-mobile-sidebar", handleToggle);
    window.addEventListener("close-mobile-sidebar", handleClose);
    return () => {
      window.removeEventListener("toggle-mobile-sidebar", handleToggle);
      window.removeEventListener("close-mobile-sidebar", handleClose);
    };
  }, []);

  const sidebarContent = (onNavigate?: () => void) => (
    <>
      <SidebarBrand isCollapsed={isCollapsed} onToggleCollapse={onToggleCollapse} />
      <SidebarNav
        items={navItems}
        activeLabel={activeLabel}
        isCollapsed={isCollapsed}
        onNavigate={onNavigate}
      />
      <SidebarPromo isCollapsed={isCollapsed} />
    </>
  );

  const desktopAside = (
    <aside className={cn("sidebar-shell hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col overflow-hidden transition-[width] duration-300", isCollapsed ? "w-[72px]" : "w-[225px]")}>
      {/* Background layers */}
      <div className="absolute inset-0 bg-[#040810]/[0.97]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(154,53,255,0.08),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(139,37,255,0.05),transparent_50%)]" />

      {/* Right border glow */}
      <div className="absolute right-0 inset-y-0 w-px bg-gradient-to-b from-[#9a35ff]/20 via-white/[0.08] to-[#9a35ff]/10" />
      <div className="pointer-events-none absolute right-0 top-0 h-32 w-px shadow-[0_0_12px_rgba(154,53,255,0.3)]" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col">
        {sidebarContent()}
      </div>
    </aside>
  );

  const mobileDrawer = isOpen ? (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-md"
        onClick={() => setIsOpen(false)}
        aria-hidden
      />
      <aside className="sidebar-shell fixed inset-y-0 left-0 z-50 flex w-[225px] flex-col overflow-hidden animate-in slide-in-from-left duration-300">
        {/* Background layers */}
        <div className="absolute inset-0 bg-[#040810]/[0.98]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(154,53,255,0.08),transparent_60%)]" />

        {/* Right border glow */}
        <div className="absolute right-0 inset-y-0 w-px bg-gradient-to-b from-[#9a35ff]/25 via-white/10 to-[#9a35ff]/10" />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col">
          <div className="flex justify-end p-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="group rounded-lg p-1.5 text-white/45 transition-all hover:bg-white/5 hover:text-white"
              aria-label="Close menu"
            >
              <X className="h-5 w-5 transition-transform group-hover:rotate-90" />
            </button>
          </div>
          {sidebarContent(() => setIsOpen(false))}
        </div>
      </aside>
    </div>
  ) : null;

  return (
    <>
      {desktopAside}
      {mobileDrawer}
    </>
  );
}
