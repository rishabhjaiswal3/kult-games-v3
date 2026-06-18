import { Clapperboard, FileVideo, PenTool, UploadCloud } from "lucide-react";

type CreatorStudioPageProps = {
  mode: "platform" | "studio";
};

export default function CreatorStudioPage({ mode }: CreatorStudioPageProps) {
  const isPlatform = mode === "platform";
  const title = isPlatform ? "Creator Platform" : "Creator Studio";
  const eyebrow = isPlatform ? "Campaigns · publishing · creator ops" : "Uploads · edits · moments";
  const Icon = isPlatform ? PenTool : Clapperboard;

  return (
    <section className="min-h-[calc(100dvh-7rem)]">
      <div className="relative overflow-hidden rounded-md border border-white/10 bg-[#050b16] px-5 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_20%_85%,rgba(154,53,255,0.2),transparent_34%)]" />
        <div className="relative">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-md border border-cyan-200/20 bg-cyan-200/10 text-cyan-100">
            <Icon className="h-6 w-6" />
          </div>
          <p className="font-tech text-xs font-bold uppercase tracking-[0.22em] text-cyan-100/70">{eyebrow}</p>
          <h1 className="mt-3 font-tech text-3xl font-black uppercase tracking-[0.08em] text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/64">
            This access tier is enabled. The production creator workspace can plug into this route without changing the access-code system.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { icon: UploadCloud, label: "Upload" },
              { icon: FileVideo, label: "Moments" },
              { icon: PenTool, label: "Campaigns" },
            ].map((item) => (
              <div key={item.label} className="rounded-md border border-white/10 bg-white/[0.035] p-4">
                <item.icon className="h-5 w-5 text-cyan-100" />
                <div className="mt-3 font-tech text-xs font-bold uppercase tracking-[0.16em] text-white/80">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
