import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { EarlyAccessHero } from '@/components/home/early-access-hero';
import { VideoSection } from '@/components/home/video-section';
import { ReadyNowSection } from '@/components/home/ready-now-section';
import { ComingSoonSection } from '@/components/home/coming-soon-section';
import { RoadmapPreviewSection } from '@/components/home/roadmap-preview-section';
import { FinalCtaSection } from '@/components/home/final-cta-section';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <EarlyAccessHero />
        <VideoSection />
        <ReadyNowSection />
        <ComingSoonSection />
        <RoadmapPreviewSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </>
  );
}
