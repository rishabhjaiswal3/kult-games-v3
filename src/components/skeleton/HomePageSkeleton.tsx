import Footer from "@/components/Footer";
import { HomeHeroSkeleton } from "@/components/skeleton/HomeHeroSkeleton";
import { GamesSectionSkeleton } from "@/components/skeleton/GamesSectionSkeleton";
import { VideoShowcaseBlockSkeleton } from "@/components/skeleton/VideoShowcaseBlockSkeleton";
import { AIConciergeBlockSkeleton } from "@/components/skeleton/AIConciergeBlockSkeleton";
import { AIArenaCtaBlockSkeleton } from "@/components/skeleton/AIArenaCtaBlockSkeleton";

/**
 * Full home layout below the navbar while the first games request (or other bootstrap) is in flight.
 */
export function HomePageSkeleton() {
  return (
    <main className="bg-background" aria-busy="true" aria-label="Loading page">
      <HomeHeroSkeleton />
      <GamesSectionSkeleton />
      <VideoShowcaseBlockSkeleton heightClass="h-[45vh]" />
      <AIConciergeBlockSkeleton />
      <AIArenaCtaBlockSkeleton />
      <VideoShowcaseBlockSkeleton heightClass="h-[40vh]" />
      <Footer />
    </main>
  );
}
