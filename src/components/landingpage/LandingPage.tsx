import {
  Header,
  HeroSection,
  ADHDChallengesSection,
  StatisticsSection,
  FeaturesSection,
  WhoSparksForSection,
  UniquenessSection,
  CTASection,
  Footer,
} from "./index";

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F3FB" }}>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HeroSection />
        <ADHDChallengesSection />
        <StatisticsSection />
        <FeaturesSection />
        <WhoSparksForSection />
        <UniquenessSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
