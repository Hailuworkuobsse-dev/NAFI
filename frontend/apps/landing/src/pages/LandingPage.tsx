import { SEO } from '@/components/SEO';
import { AudiencePaths } from '@/sections/AudiencePaths';
import { FAQ } from '@/sections/FAQ';
import { FinalCTA } from '@/sections/FinalCTA';
import { Hero } from '@/sections/Hero';
import { HowItWorks } from '@/sections/HowItWorks';
import { ImpactDashboard } from '@/sections/ImpactDashboard';
import { LiveOpportunities } from '@/sections/LiveOpportunities';
import { Problem } from '@/sections/Problem';
import { Security } from '@/sections/Security';
import { Solution } from '@/sections/Solution';
import { Testimonials } from '@/sections/Testimonials';
import { TrustBar } from '@/sections/TrustBar';

export function LandingPage() {
  return (
    <>
      <SEO />
      <Hero />
      <TrustBar />
      <Problem />
      <Solution />
      <AudiencePaths />
      <HowItWorks />
      <LiveOpportunities />
      <ImpactDashboard />
      <Security />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </>
  );
}
