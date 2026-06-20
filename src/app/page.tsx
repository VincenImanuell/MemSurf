import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { MultiAgentSection } from "@/components/landing/MultiAgentSection";
import { TrackFitSection } from "@/components/landing/TrackFitSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Footer } from "@/components/landing/Footer";
import { FixedBubbles } from "@/components/landing/FixedBubbles";
import { LandingLoadGate } from "@/components/landing/LandingLoadGate";

export default function Home() {
  return (
    <LandingLoadGate>
      <main className="flex flex-col">
        <Navbar />
        {/* viewport-pinned ambient bubbles for all post-hero sections (stay put on scroll) */}
        <FixedBubbles />
        <div className="relative z-10">
          <Hero />
          <ProblemSection />
        </div>
        {/* z-40 keeps the Features section above the fixed rising-bubble layer
            (z-30) so those bubbles don't show over it — its own sway bubbles stay. */}
        <div className="relative z-40 -mt-20">
          <FeaturesSection />
        </div>
        <MultiAgentSection />
        <TrackFitSection />
        {/* HowItWorks + Footer share one continuous navy field with a single
            rising-bubble layer, divided only by a thin line — so the bubbles
            don't visibly cut at the section seam. */}
        <div className="relative bg-navy overflow-hidden border-t border-white/10">
          <div className="relative z-10">
            <HowItWorks />
            <Footer />
          </div>
        </div>
      </main>
    </LandingLoadGate>
  );
}
