import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, X } from "lucide-react";
import zeroGLogo from "@/assets/0G Logo.png";
import kultLogo from "@/assets/Kult Logo.png";
import dashboardLiveCard from "@/assets/dashboard-live-card.png";
import { APP_NAV_ITEMS } from "@/layout/navConfig";
import { cn } from "@/lib/utils";

type AppSidebarProps = {
  activeLabel?: string;
};

function SidebarNav({
  activeLabel,
  onNavigate,
}: {
  activeLabel: string;
  onNavigate?: () => void;
}) {
  const location = useLocation();

  return (
    <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3">
      {APP_NAV_ITEMS.map((item) => {
        const isActive =
          item.label === activeLabel ||
          (item.path !== "/" && location.pathname.startsWith(item.path));
        return (
          <Link
            key={item.label}
            to={item.path}
            onClick={onNavigate}
            className={cn(
              "flex h-[42px] items-center gap-4 rounded-md border px-5 text-[12px] font-semibold uppercase transition font-tech",
              isActive
                ? "border-[#8f27ff]/55 bg-[#8f27ff]/15 text-white shadow-[inset_3px_0_0_#a029ff]"
                : "border-transparent text-white/68 hover:bg-white/5 hover:text-white",
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span className="min-w-0 flex-1">{item.label}</span>
            {item.tag ? (
              <span className="rounded-sm border border-[#9b32ff] px-1.5 py-0.5 text-[9px] text-[#b95cff]">
                {item.tag}
              </span>
            ) : null}
          </Link>
        );
      })}
      <Link
        to="/games"
        onClick={onNavigate}
        className="btn-arena-primary mt-2 flex h-11 items-center justify-center gap-2 rounded px-4 font-tech text-[10px]"
      >
        EXPLORE GAMES <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </nav>
  );
}

function SidebarBrand() {
  return (
    <Link to="/" className="block shrink-0 px-6 pb-3 pt-5">
      <div className="flex items-center gap-2">
        <img src={zeroGLogo} alt="0G" className="h-5 w-auto object-contain" />
        <span className="h-3.5 w-px bg-white/15" aria-hidden />
        <img src={kultLogo} alt="Kult Games" className="h-5 w-auto object-contain" />
      </div>
      <p className="mt-2 text-[8px] uppercase tracking-[0.34em] text-white/55">Powered by 0G · AI Arena</p>
    </Link>
  );
}

function SidebarPromo() {
  return (
    <div className="shrink-0 p-4">
      <div className="relative overflow-hidden rounded-md border border-white/12 bg-[#080d19]">
        <img
          src={dashboardLiveCard}
          alt="Kult Games live"
          className="h-[clamp(140px,18vh,200px)] w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080817] via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <p className="font-tech text-[9px] uppercase tracking-wider text-[#b95cff]">Live on 0G</p>
          <p className="text-[11px] font-semibold text-white/90">Play. Compete. Own the moment.</p>
        </div>
      </div>
    </div>
  );
}

export function AppSidebar({ activeLabel = "Home" }: AppSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

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

  const desktopAside = (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-[225px] flex-col overflow-y-auto border-r border-white/12 bg-[#050913]/95">
      <SidebarBrand />
      <SidebarNav activeLabel={activeLabel} />
      <SidebarPromo />
    </aside>
  );

  const mobileDrawer = isOpen ? (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
        aria-hidden
      />
      <aside className="fixed inset-y-0 left-0 z-50 flex w-[225px] flex-col overflow-y-auto border-r border-white/12 bg-[#050913] animate-in slide-in-from-left duration-300">
        <div className="flex justify-end p-3">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded p-1.5 text-white/55 hover:bg-white/5 hover:text-white"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <SidebarBrand />
        <SidebarNav activeLabel={activeLabel} onNavigate={() => setIsOpen(false)} />
        <SidebarPromo />
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
