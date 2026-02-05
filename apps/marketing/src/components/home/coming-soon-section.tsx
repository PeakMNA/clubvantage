import Link from 'next/link';
import {
  Smartphone,
  Sparkles,
  Megaphone,
  ArrowRight,
  Clock
} from 'lucide-react';

const comingSoonModules = [
  {
    icon: Smartphone,
    title: 'Member Portal',
    description: 'Mobile-first self-service',
    eta: 'Q3 2026',
    features: [
      'PWA for iOS & Android',
      'Book, pay, manage accounts',
      'Family account access',
    ],
    href: '/features/portal',
  },
  {
    icon: Sparkles,
    title: 'Aura AI',
    description: 'Intelligent assistant',
    eta: 'Q3 2026',
    features: [
      '24/7 member support',
      'Natural language booking',
      'Operational insights',
    ],
    href: '/features/aura',
  },
  {
    icon: Megaphone,
    title: 'AI Marketing',
    description: 'Engagement & acquisition',
    eta: 'Q4 2026',
    features: [
      'Automated campaigns',
      'AI ad creation',
      'ROI optimization',
    ],
    href: '/features/marketing',
  },
];

export function ComingSoonSection() {
  return (
    <section className="py-20 md:py-28 bg-cream-200/50">
      <div className="container">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
            In Development
          </span>
        </div>
        <h2 className="font-serif text-h1 text-charcoal-800 max-w-2xl">
          Coming Soon
        </h2>
        <p className="mt-4 text-body-lg text-charcoal-500 max-w-2xl">
          These features are actively being built. Join as a founding member to influence priorities.
        </p>

        {/* Module Cards Grid */}
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {comingSoonModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.title}
                href={module.href}
                className="group relative p-8 bg-white rounded-2xl border-2 border-dashed border-amber-200
                         hover:border-amber-300 hover:shadow-lg transition-all duration-300"
              >
                {/* ETA badge */}
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                    <Clock className="h-3 w-3" />
                    {module.eta}
                  </span>
                </div>

                {/* Icon */}
                <div className="flex h-14 w-14 items-center justify-center rounded-xl
                              bg-amber-100 group-hover:bg-amber-500 transition-colors duration-300">
                  <Icon className="h-7 w-7 text-amber-600 group-hover:text-white transition-colors duration-300" />
                </div>

                {/* Content */}
                <h3 className="mt-6 text-xl font-semibold text-charcoal-800 group-hover:text-amber-600 transition-colors">
                  {module.title}
                </h3>
                <p className="mt-2 text-charcoal-500">
                  {module.description}
                </p>

                {/* Feature list */}
                <ul className="mt-6 space-y-3">
                  {module.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-charcoal-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0 mt-2" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Learn more link */}
                <div className="mt-6 flex items-center gap-1 text-sm font-medium text-amber-600
                              group-hover:text-amber-500 transition-colors">
                  Learn more
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
