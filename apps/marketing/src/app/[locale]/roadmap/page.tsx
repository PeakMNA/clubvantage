'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ChevronUp,
  MessageSquare,
  Clock,
  CheckCircle2,
  Rocket,
  Lightbulb,
  Plus,
  ArrowRight,
  CalendarDays,
  Star,
  X,
  Mail,
} from 'lucide-react';
import { toggleVote, getVoteCounts, getUserVotes } from '@/app/actions/voting';
import { submitFeatureSuggestion } from '@/app/actions/suggestions';

type FeatureStatus = 'planned' | 'in-progress' | 'completed' | 'considering';

interface Feature {
  id: string;
  title: string;
  description: string;
  status: FeatureStatus;
  votes: number;
  comments: number;
  category: string;
  eta?: string;
  isMvp?: boolean;
  releaseVersion?: string;
}

interface TimelineQuarter {
  quarter: string;
  labelKey: string;
  features: string[];
  isCurrent?: boolean;
}

const timeline: TimelineQuarter[] = [
  {
    quarter: 'Now',
    labelKey: 'foundation',
    isCurrent: true,
    features: [
      'Member Management & Directory',
      'Billing & Invoicing',
      'Golf Tee Sheet',
      'Facility Booking',
      'POS & Retail',
    ],
  },
  {
    quarter: 'Q3 2026',
    labelKey: 'launch',
    features: [
      'Member Portal (PWA)',
      'Aura AI Assistant (Basic)',
      'Mobile Apps (iOS & Android)',
    ],
  },
  {
    quarter: 'Q4 2026',
    labelKey: 'engagement',
    features: [
      'AI Marketing - Engagement',
      'Advanced Reporting',
      'WhatsApp Notifications',
    ],
  },
  {
    quarter: '2027',
    labelKey: 'intelligence',
    features: [
      'AI Marketing - Acquisition',
      'Predictive Analytics',
      'Handicap Integration',
      'Tournament Management',
    ],
  },
  {
    quarter: '2028',
    labelKey: 'ecosystem',
    features: [
      'Public API',
      'Integration Marketplace',
      'Multi-location Support',
      'White-label Option',
    ],
  },
];

const categories = ['All', 'Membership', 'Billing', 'Booking', 'Golf', 'Portal', 'AI', 'Integrations', 'Retail', 'Marketing'];

const initialFeatures: Feature[] = [
  { id: '1', title: 'Member Management & Directory', description: 'Complete member lifecycle management including applications, contracts, renewals, and a powerful searchable directory.', status: 'completed', votes: 0, comments: 0, category: 'Membership', releaseVersion: 'v1.0' },
  { id: '2', title: 'Billing & Invoicing', description: 'Comprehensive billing with invoices, payments, AR management, and Thai tax compliance built-in.', status: 'completed', votes: 0, comments: 0, category: 'Billing', releaseVersion: 'v1.0' },
  { id: '3', title: 'Golf Tee Sheet', description: 'Visual drag-and-drop tee sheet with caddy and cart management, player assignments, and check-in workflow.', status: 'completed', votes: 0, comments: 0, category: 'Golf', releaseVersion: 'v1.0' },
  { id: '4', title: 'Facility Booking', description: 'Book courts, rooms, and services with visual calendar, recurring reservations, and conflict detection.', status: 'completed', votes: 0, comments: 0, category: 'Booking', releaseVersion: 'v1.0' },
  { id: '5', title: 'POS & Retail', description: 'Full-featured point-of-sale for pro shops with inventory management, barcode scanning, and member charging.', status: 'completed', votes: 0, comments: 0, category: 'Retail', releaseVersion: 'v1.0' },
  { id: '6', title: 'Member Portal (PWA)', description: 'Mobile-first self-service portal for members to book, view statements, update profiles, and manage their membership.', status: 'in-progress', votes: 38, comments: 12, category: 'Portal', eta: 'Q3 2026' },
  { id: '7', title: 'Aura AI Assistant', description: 'Natural language booking and club assistant. "Book me a tee time tomorrow at 9am" or "Show my outstanding balance."', status: 'in-progress', votes: 27, comments: 9, category: 'AI', eta: 'Q3 2026' },
  { id: '8', title: 'Mobile Apps (iOS & Android)', description: 'Native mobile apps for members with push notifications, digital member card, and offline access.', status: 'in-progress', votes: 35, comments: 8, category: 'Portal', eta: 'Q3 2026' },
  { id: '9', title: 'AI Marketing - Member Engagement', description: 'AI-powered campaigns for member retention: smart email sequences, push notifications, and personalized offers based on behavior.', status: 'planned', votes: 22, comments: 6, category: 'Marketing', eta: 'Q4 2026' },
  { id: '10', title: 'Advanced Reporting Dashboard', description: 'Comprehensive analytics with customizable dashboards, KPIs, and automated scheduled reports.', status: 'planned', votes: 18, comments: 4, category: 'AI', eta: 'Q4 2026' },
  { id: '11', title: 'WhatsApp Notifications', description: 'Send booking confirmations, payment reminders, and club announcements via WhatsApp for higher engagement.', status: 'planned', votes: 29, comments: 7, category: 'Integrations', eta: 'Q4 2026' },
  { id: '12', title: 'AI Marketing - Acquisition', description: 'AI creates and optimizes digital ad campaigns across Google, Facebook, and Instagram to acquire new members.', status: 'considering', votes: 14, comments: 5, category: 'Marketing', eta: '2027' },
  { id: '13', title: 'Predictive Analytics', description: 'AI identifies churn risk, revenue opportunities, and optimal pricing. Proactive insights for better decisions.', status: 'considering', votes: 11, comments: 3, category: 'AI', eta: '2027' },
  { id: '14', title: 'Golf Handicap Integration', description: 'Automatic handicap calculation and syncing with national golf associations (TGA, SGA, MGA, HKGA).', status: 'considering', votes: 21, comments: 6, category: 'Golf', eta: '2027' },
  { id: '15', title: 'Tournament Management', description: 'Full tournament setup with brackets, live scoring, leaderboards, and prize distribution.', status: 'considering', votes: 17, comments: 5, category: 'Golf', eta: '2027' },
  { id: '16', title: 'Public API', description: 'Full REST and GraphQL API for building custom integrations and third-party applications.', status: 'considering', votes: 8, comments: 3, category: 'Integrations', eta: '2028' },
  { id: '17', title: 'Integration Marketplace', description: 'Pre-built integrations with popular systems: accounting (Xero, QuickBooks), POS, access control, and more.', status: 'considering', votes: 12, comments: 2, category: 'Integrations', eta: '2028' },
  { id: '18', title: 'Multi-location Support', description: 'Manage multiple club locations from one dashboard with consolidated reporting and shared member database.', status: 'considering', votes: 9, comments: 2, category: 'Membership', eta: '2028' },
  { id: '19', title: 'White-label Option', description: "Fully branded member portal and apps with your club's logo, colors, and custom domain.", status: 'considering', votes: 6, comments: 1, category: 'Portal', eta: '2028' },
];

export default function RoadmapPage() {
  const t = useTranslations('roadmap');
  const tCommon = useTranslations('common');
  const [features, setFeatures] = React.useState(initialFeatures);
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [votedFeatures, setVotedFeatures] = React.useState<Set<string>>(new Set());
  const [showSuggestModal, setShowSuggestModal] = React.useState(false);
  const [showEmailModal, setShowEmailModal] = React.useState(false);
  const [pendingVoteId, setPendingVoteId] = React.useState<string | null>(null);
  const [voterEmail, setVoterEmail] = React.useState('');

  React.useEffect(() => {
    const savedEmail = localStorage.getItem('voter_email');
    if (savedEmail) setVoterEmail(savedEmail);
    getVoteCounts().then((counts) => {
      setFeatures((prev) => prev.map((f) => ({ ...f, votes: counts[f.id] ?? f.votes })));
    });
    if (savedEmail) {
      getUserVotes(savedEmail).then((ids) => { setVotedFeatures(new Set(ids)); });
    }
  }, []);

  const handleVote = async (featureId: string) => {
    if (!voterEmail) { setPendingVoteId(featureId); setShowEmailModal(true); return; }
    const wasVoted = votedFeatures.has(featureId);
    setVotedFeatures((prev) => { const next = new Set(prev); if (wasVoted) next.delete(featureId); else next.add(featureId); return next; });
    setFeatures((prev) => prev.map((f) => f.id === featureId ? { ...f, votes: f.votes + (wasVoted ? -1 : 1) } : f));
    const counts = await toggleVote(voterEmail, featureId);
    setFeatures((prev) => prev.map((f) => ({ ...f, votes: counts[f.id] ?? f.votes })));
  };

  const handleEmailSubmit = async (email: string) => {
    setVoterEmail(email);
    localStorage.setItem('voter_email', email);
    setShowEmailModal(false);
    const userVotes = await getUserVotes(email);
    setVotedFeatures(new Set(userVotes));
    if (pendingVoteId) {
      const counts = await toggleVote(email, pendingVoteId);
      setVotedFeatures((prev) => new Set(prev).add(pendingVoteId!));
      setFeatures((prev) => prev.map((f) => ({ ...f, votes: counts[f.id] ?? f.votes })));
      setPendingVoteId(null);
    }
  };

  const filteredFeatures = selectedCategory === 'All' ? features : features.filter((f) => f.category === selectedCategory);
  const groupedFeatures = {
    'in-progress': filteredFeatures.filter((f) => f.status === 'in-progress'),
    planned: filteredFeatures.filter((f) => f.status === 'planned'),
    considering: filteredFeatures.filter((f) => f.status === 'considering'),
    completed: filteredFeatures.filter((f) => f.status === 'completed'),
  };

  return (
    <>
      <Header />
      <main className="pt-20">
        <section className="bg-primary-800 py-16 md:py-20">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-label uppercase tracking-widest text-accent-400">{t('title')}</span>
              <h1 className="mt-4 font-serif text-h1 text-cream-50">{t('productRoadmap')}</h1>
              <p className="mt-4 text-body-lg text-cream-100">{t('subtitle')}</p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild variant="accent"><Link href="/waitlist">{t('joinToVote')}<ArrowRight className="h-4 w-4 ml-1" /></Link></Button>
                <Button variant="secondary" className="border-cream-50/30 text-cream-50 hover:bg-cream-50/10" onClick={() => setShowSuggestModal(true)}><Plus className="h-4 w-4 mr-1" />{t('suggestAFeature')}</Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-cream-100 border-b border-cream-300">
          <div className="container">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100"><CalendarDays className="h-5 w-5 text-primary-600" /></div>
              <h2 className="font-serif text-2xl text-charcoal-800">{t('projectedTimeline')}</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-5">
              {timeline.map((quarter, index) => (
                <div key={quarter.quarter} className={cn('relative rounded-2xl border-2 p-6 transition-all duration-300', quarter.isCurrent ? 'border-primary-500 bg-white shadow-lg' : 'border-cream-300 bg-white hover:border-cream-400')}>
                  {quarter.isCurrent && (<div className="absolute -top-3 left-4 inline-flex items-center gap-1 rounded-full bg-accent-400 px-3 py-1 text-xs font-medium text-primary-900"><Star className="h-3 w-3" />{t('currentFocus')}</div>)}
                  <div className="mb-4">
                    <div className="font-serif text-lg font-bold text-charcoal-800">{quarter.quarter}</div>
                    <div className={cn('text-sm font-medium', quarter.isCurrent ? 'text-primary-600' : 'text-charcoal-500')}>{t(quarter.labelKey)}</div>
                  </div>
                  <ul className="space-y-2">
                    {quarter.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle2 className={cn('h-4 w-4 shrink-0 mt-0.5', quarter.isCurrent ? 'text-primary-500' : 'text-charcoal-400')} />
                        <span className="text-sm text-charcoal-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {index < timeline.length - 1 && (<div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-cream-400" />)}
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-charcoal-500 text-center">
              {t('timelineDisclaimer')}<Link href="/waitlist" className="text-primary-600 hover:text-primary-500 ml-1">{t('joinTheWaitlist')}</Link> {t('toInfluenceRoadmap')}
            </p>
          </div>
        </section>

        <section className="border-b border-cream-300 bg-white sticky top-20 z-40">
          <div className="container py-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button key={category} onClick={() => setSelectedCategory(category)} className={cn('rounded-full px-4 py-2 text-sm font-medium transition-all duration-300', selectedCategory === category ? 'bg-primary-500 text-cream-50' : 'bg-cream-200 text-charcoal-600 hover:bg-cream-300')}>{category}</button>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-cream-100">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-4">
              <div>
                <div className="flex items-center gap-2 mb-4"><Rocket className="h-5 w-5 text-amber-600" /><h2 className="font-semibold text-charcoal-800">{t('inProgress')}</h2><span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">{groupedFeatures['in-progress'].length}</span></div>
                <div className="space-y-4">{groupedFeatures['in-progress'].sort((a, b) => b.votes - a.votes).map((feature) => (<FeatureCard key={feature.id} feature={feature} voted={votedFeatures.has(feature.id)} onVote={() => handleVote(feature.id)} />))}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-4"><Clock className="h-5 w-5 text-primary-600" /><h2 className="font-semibold text-charcoal-800">{t('planned')}</h2><span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">{groupedFeatures.planned.length}</span></div>
                <div className="space-y-4">{groupedFeatures.planned.sort((a, b) => b.votes - a.votes).map((feature) => (<FeatureCard key={feature.id} feature={feature} voted={votedFeatures.has(feature.id)} onVote={() => handleVote(feature.id)} />))}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-4"><Lightbulb className="h-5 w-5 text-accent-600" /><h2 className="font-semibold text-charcoal-800">{t('considering')}</h2><span className="rounded-full bg-accent-100 px-2 py-0.5 text-xs font-medium text-accent-700">{groupedFeatures.considering.length}</span></div>
                <div className="space-y-4">{groupedFeatures.considering.sort((a, b) => b.votes - a.votes).map((feature) => (<FeatureCard key={feature.id} feature={feature} voted={votedFeatures.has(feature.id)} onVote={() => handleVote(feature.id)} />))}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-4"><CheckCircle2 className="h-5 w-5 text-emerald-600" /><h2 className="font-semibold text-charcoal-800">{t('completed')}</h2><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">{groupedFeatures.completed.length}</span></div>
                <div className="space-y-4">{groupedFeatures.completed.sort((a, b) => b.votes - a.votes).map((feature) => (<FeatureCard key={feature.id} feature={feature} voted={votedFeatures.has(feature.id)} onVote={() => handleVote(feature.id)} />))}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-primary-800 py-16">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-h2 text-cream-50">{t('haveAFeatureIdea')}</h2>
              <p className="mt-4 text-body-lg text-cream-100">{t('joinFoundingCommunity')}</p>
              <div className="mt-8"><Button asChild variant="accent"><Link href="/waitlist">{tCommon('joinTheWaitlist')}</Link></Button></div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      {showSuggestModal && <SuggestFeatureModal voterEmail={voterEmail} onClose={() => setShowSuggestModal(false)} />}
      {showEmailModal && <EmailModal onSubmit={handleEmailSubmit} onClose={() => { setShowEmailModal(false); setPendingVoteId(null); }} />}
    </>
  );
}

function FeatureCard({ feature, voted, onVote }: { feature: Feature; voted: boolean; onVote: () => void }) {
  const isCompleted = feature.status === 'completed';
  return (
    <div className={cn('rounded-2xl border bg-white p-4 hover:shadow-md transition-all duration-300', feature.isMvp ? 'border-primary-300 ring-1 ring-primary-100' : 'border-cream-300')}>
      <div className="flex items-start gap-3">
        {isCompleted && feature.releaseVersion ? (
          <div className="flex flex-col items-center rounded-xl border-2 border-emerald-200 bg-emerald-50 px-2 py-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-600" /><span className="text-xs font-semibold text-emerald-700">{feature.releaseVersion}</span></div>
        ) : (
          <button onClick={onVote} className={cn('flex flex-col items-center rounded-xl border-2 px-2 py-1.5 transition-all duration-300', voted ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-cream-300 text-charcoal-500 hover:border-cream-400')}><ChevronUp className="h-4 w-4" /><span className="text-sm font-semibold">{feature.votes}</span></button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <h3 className="font-semibold text-charcoal-800 text-sm leading-tight flex-1">{feature.title}</h3>
            {feature.isMvp && (<span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700"><Star className="h-3 w-3" />MVP</span>)}
          </div>
          <p className="mt-1 text-xs text-charcoal-500 line-clamp-2">{feature.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-cream-200 px-2 py-0.5 text-xs text-charcoal-600">{feature.category}</span>
            {feature.eta && (<span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', feature.isMvp ? 'bg-primary-50 text-primary-600' : 'bg-cream-100 text-charcoal-500')}>{feature.eta}</span>)}
            {!isCompleted && (<span className="flex items-center gap-1 text-xs text-charcoal-400"><MessageSquare className="h-3 w-3" />{feature.comments}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmailModal({ onSubmit, onClose }: { onSubmit: (email: string) => void; onClose: () => void }) {
  const t = useTranslations('roadmap');
  const [email, setEmail] = React.useState('');
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (email.trim()) onSubmit(email.trim()); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/50">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><Mail className="h-5 w-5 text-primary-500" /><h2 className="font-serif text-lg font-semibold text-charcoal-800">{t('voteOnFeatures')}</h2></div>
          <button onClick={onClose} className="text-charcoal-400 hover:text-charcoal-600 transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <p className="text-sm text-charcoal-500 mb-4">{t('enterEmailToVote')}</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required autoFocus className="flex h-12 w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-base text-charcoal-700 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          <Button type="submit" fullWidth>{t('startVoting')}</Button>
        </form>
      </div>
    </div>
  );
}

function SuggestFeatureModal({ voterEmail, onClose }: { voterEmail: string; onClose: () => void }) {
  const t = useTranslations('roadmap');
  const tCommon = useTranslations('common');
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await submitFeatureSuggestion({ email: voterEmail || undefined, title, description, category });
      if (result.success) setIsSubmitted(true);
    } catch { /* Silently fail */ } finally { setIsSubmitting(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/50">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100"><CheckCircle2 className="h-6 w-6 text-primary-600" /></div>
            <h3 className="mt-4 font-serif font-semibold text-charcoal-800">{t('thanksForSuggestion')}</h3>
            <p className="mt-2 text-charcoal-500">{t('weWillReview')}</p>
            <Button onClick={onClose} className="mt-6">{tCommon('close')}</Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl font-semibold text-charcoal-800">{t('suggestAFeature')}</h2>
              <button onClick={onClose} className="text-charcoal-400 hover:text-charcoal-600 transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1.5">{t('featureTitle')}</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('featureTitlePlaceholder')} required className="flex h-12 w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-base text-charcoal-700 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1.5">{t('description')}</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('descriptionPlaceholder')} rows={4} required className="flex w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-base text-charcoal-700 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1.5">{t('category')}</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} required className="flex h-12 w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-base text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                  <option value="">{tCommon('selectCategory')}</option>
                  {categories.filter((c) => c !== 'All').map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={onClose} fullWidth>{tCommon('cancel')}</Button>
                <Button type="submit" fullWidth isLoading={isSubmitting}>{t('submitSuggestion')}</Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
