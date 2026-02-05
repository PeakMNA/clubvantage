import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import {
  ShoppingBag,
  Barcode,
  Package,
  CreditCard,
  TrendingUp,
  Users,
  Receipt,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const StatusBadge = () => (
  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium ml-3">
    <CheckCircle2 className="h-4 w-4" />
    Built
  </span>
);

const features = [
  {
    icon: Barcode,
    title: 'Point of Sale',
    description: 'Fast, intuitive checkout with barcode scanning, member lookup, and flexible payment options.',
  },
  {
    icon: Package,
    title: 'Inventory Management',
    description: 'Track stock levels, set reorder points, manage suppliers, and receive automated low-stock alerts.',
  },
  {
    icon: CreditCard,
    title: 'Member Charging',
    description: 'Charge purchases directly to member accounts. Seamless integration with billing module.',
  },
  {
    icon: TrendingUp,
    title: 'Sales Analytics',
    description: 'Real-time dashboards showing sales trends, top products, margins, and seasonal patterns.',
  },
  {
    icon: Users,
    title: 'Staff Management',
    description: 'Track sales by staff member, manage permissions, and monitor performance metrics.',
  },
  {
    icon: Receipt,
    title: 'Receipt & Returns',
    description: 'Digital receipts, easy returns processing, and complete transaction history.',
  },
];

const useCases = [
  {
    title: 'Pro Shop Sales',
    description: 'Sell golf equipment, apparel, and accessories with member discounts automatically applied.',
  },
  {
    title: 'F&B Retail',
    description: 'Manage snack bar and beverage sales with quick member account charging.',
  },
  {
    title: 'Merchandise',
    description: 'Club-branded merchandise, tournament prizes, and gift shop items.',
  },
  {
    title: 'Equipment Rentals',
    description: 'Track rental equipment, calculate fees, and manage returns seamlessly.',
  },
];

export default function RetailFeaturePage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="bg-primary-800 py-16 md:py-24">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-400/20">
                  <ShoppingBag className="h-6 w-6 text-accent-400" />
                </div>
                <StatusBadge />
              </div>
              <span className="text-label uppercase tracking-widest text-accent-400">
                POS & Retail
              </span>
              <h1 className="mt-4 font-serif text-h1 text-cream-50">
                Pro Shop & Retail Operations
              </h1>
              <p className="mt-6 text-body-lg text-cream-100">
                Full-featured point-of-sale designed for club retail operations.
                Manage inventory, process sales, and charge directly to member accounts.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild variant="accent">
                  <Link href="/waitlist">
                    Join Waitlist
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="border-cream-50/30 text-cream-50 hover:bg-cream-50/10">
                  <Link href="/waitlist">Join for Founder Pricing</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 md:py-24 bg-cream-100">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="font-serif text-h2 text-charcoal-800">
                Everything You Need for Retail
              </h2>
              <p className="mt-4 text-body-lg text-charcoal-500 max-w-2xl mx-auto">
                Purpose-built for club environments with member integration at its core.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group p-6 bg-white rounded-2xl border border-cream-300 hover:border-primary-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 group-hover:bg-primary-500 transition-colors duration-300">
                      <Icon className="h-6 w-6 text-primary-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-charcoal-800">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-charcoal-500">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-label uppercase tracking-widest text-accent-500">
                  Use Cases
                </span>
                <h2 className="mt-4 font-serif text-h2 text-charcoal-800">
                  Built for Club Retail
                </h2>
                <p className="mt-4 text-body-lg text-charcoal-500">
                  Whether it&apos;s your pro shop, snack bar, or merchandise store,
                  our POS handles it all with seamless member integration.
                </p>
                <ul className="mt-8 space-y-6">
                  {useCases.map((useCase) => (
                    <li key={useCase.title} className="flex items-start gap-4">
                      <CheckCircle2 className="h-6 w-6 text-primary-500 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-charcoal-800">{useCase.title}</h3>
                        <p className="text-charcoal-500">{useCase.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                  <ShoppingBag className="h-32 w-32 text-primary-300" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary-700 py-16">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-h2 text-cream-50">
                Ready to Streamline Your Retail?
              </h2>
              <p className="mt-4 text-body-lg text-cream-100">
                See how ClubVantage POS can transform your pro shop operations.
              </p>
              <div className="mt-8">
                <Button asChild variant="accent">
                  <Link href="/waitlist">Join Waitlist</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
