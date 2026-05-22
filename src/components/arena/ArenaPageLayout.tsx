import type { ReactNode } from "react";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";

type ArenaPageLayoutProps = {
  children: ReactNode;
};

/** Pixel-perfect arena pages: dashboard topbar + max-width content (shared Kult sidebar via AppShell). */
export function ArenaPageLayout({ children }: ArenaPageLayoutProps) {
  return (
    <>
      <DashboardTopbar />
      <section className="mx-auto max-w-[1284px] space-y-4 px-4 py-5 sm:px-6 lg:px-8">{children}</section>
    </>
  );
}
