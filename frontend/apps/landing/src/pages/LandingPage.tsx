import { SEO } from '../components/SEO';
import { AudiencePaths } from '../sections/AudiencePaths';
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
      {/* 1. Hero - Strong opening with value prop and stats */}
      <Hero />
      
      {/* 2. Problem - Establish the pain points early */}
      <Problem />
      
      {/* 3. Solution - Present NAFI as the answer (without duplicate diagram) */}
      <Solution />
      
      {/* 4. HowItWorks - Explain the process before showing audience paths */}
      <HowItWorks />
      
      {/* 5. AudiencePaths - Show how different users benefit */}
      <AudiencePaths />
      
      {/* 6. LiveOpportunities - Display real investment opportunities */}
      <LiveOpportunities />
      
      {/* 7. ImpactDashboard - Prove results with verified metrics */}
      <ImpactDashboard />
      
      {/* 8. Security - Address trust and compliance concerns */}
      <Security />
      
      {/* 9. Testimonials - Social proof positioned near CTA */}
      <Testimonials />
      
      {/* 10. TrustBar - Additional credibility markers */}
      <TrustBar />
      
      {/* 11. FAQ - Answer final questions before conversion */}
      <FAQ />
      
      {/* 12. FinalCTA - Strong closing call-to-action */}
      <FinalCTA />
    </>
  );
}
