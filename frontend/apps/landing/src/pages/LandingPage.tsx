import { SEO } from '../components/SEO';
import { AudiencePaths } from '../sections/AudiencePaths';
import { EcosystemDiagram } from '../sections/EcosystemDiagram';
import { FAQ } from '../sections/FAQ';
import { FinalCTA } from '../sections/FinalCTA';
import { Hero } from '../sections/Hero';
import { HowItWorks } from '../sections/HowItWorks';
import { ImpactDashboard } from '../sections/ImpactDashboard';
import { LiveOpportunities } from '../sections/LiveOpportunities';
import { Problem } from '../sections/Problem';
import { Security } from '../sections/Security';
import { Solution } from '../sections/Solution';
import { Testimonials } from '../sections/Testimonials';
import { TrustBar } from '../sections/TrustBar';

export function LandingPage() {
  return (
    <>
      <SEO />

      {/* 1. Hero - Sovereign institutional opening & live simulation */}
      <Hero />

      {/* 2. TrustBar - Institutional partner credibility ticker */}
      <TrustBar />

      {/* 3. Problem - Data-driven structural agricultural bottlenecks */}
      <Problem />

      {/* 4. Solution - 4-pillar architectural foundation */}
      <Solution />

      {/* 5. EcosystemDiagram - Interactive Smart Contract Settlement & Escrow Engine */}
      <EcosystemDiagram />

      {/* 6. HowItWorks - 5-stage lifecycle explorer */}
      <HowItWorks />

      {/* 7. AudiencePaths - Dedicated stakeholder workspaces & portals */}
      <AudiencePaths />

      {/* 8. LiveOpportunities - Active agricultural pools & termsheet inspector */}
      <LiveOpportunities />

      {/* 9. ImpactDashboard - Macroeconomic & regional corridor telemetry */}
      <ImpactDashboard />

      {/* 10. Security - Sovereign regulatory compliance & Book V Commercial Code */}
      <Security />

      {/* 11. Testimonials - Real multi-stakeholder proof & case studies */}
      <Testimonials />

      {/* 12. FAQ - Institutional Q&A with category filtering */}
      <FAQ />

      {/* 13. FinalCTA - Role-based quick start onboarding */}
      <FinalCTA />
    </>
  );
}
