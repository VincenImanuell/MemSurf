import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { MultiAgentSection } from "@/components/landing/MultiAgentSection";
import { TrackFitSection } from "@/components/landing/TrackFitSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Footer } from "@/components/landing/Footer";
import { SubtleBubbles } from "@/components/landing/SubtleBubbles";
import { LandingLoadGate } from "@/components/landing/LandingLoadGate";

export default function Home() {
  return (
    <LandingLoadGate>
      <main className="flex flex-col">
        <Navbar />
        <div className="relative z-10">
          <Hero />
          <ProblemSection />
        </div>
        <div className="relative z-0 -mt-20">
          <FeaturesSection />
        </div>
        <MultiAgentSection />
        <TrackFitSection />
        {/* HowItWorks + Footer share one continuous navy field with a single
            rising-bubble layer, divided only by a thin line — so the bubbles
            don't visibly cut at the section seam. */}
        <div className="relative bg-navy overflow-hidden">
          <SubtleBubbles count={46} />
          <div className="relative z-10">
            <HowItWorks />
            <Footer />
          </div>
        </div>
      </main>
    </LandingLoadGate>
  );
}
