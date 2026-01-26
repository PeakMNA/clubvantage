import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { EarlyAccessHero } from '@/components/home/early-access-hero';
import { BenefitsSection } from '@/components/home/benefits-section';
import { ModulesSection } from '@/components/home/modules-section';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <EarlyAccessHero />
        <BenefitsSection />
        <ModulesSection />
      </main>
      <Footer />
    </>
  );
}
