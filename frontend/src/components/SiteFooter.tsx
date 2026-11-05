/**
 * Shared, animated site footer.
 *
 * Used on both the landing page and the in-app views. It carries the brand,
 * a newsletter capture, product / customer-care / legal columns, social icons
 * and the Privacy Policy + Terms modals.
 */

import { useState } from 'react';
import {
  ArrowUp,
  Clock,
  Facebook,
  FileText,
  Github,
  Instagram,
  Linkedin,
  Lock,
  Mail,
  MessageCircle,
  Send,
  Twitter,
  Youtube,
} from 'lucide-react';
import { Reveal } from './Reveal';
import { LegalModal, type LegalKind } from './LegalModal';
import type { Language } from '../types';

interface Props {
  language: Language;
  /** Switch to a dashboard view (only provided once the user is inside the app). */
  onNavigate?: (view: 'home' | 'nutrition') => void;
  /** Enter the app / start training. */
  onStart?: () => void;
}

type FooterLink =
  | { kind: 'navigate'; view: 'home' | 'nutrition'; label: string }
  | { kind: 'section'; id: string; label: string }
  | { kind: 'legal'; doc: LegalKind; label: string }
  | { kind: 'external'; href: string; label: string };

const SOCIALS = [
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
  { icon: Youtube, label: 'YouTube', href: 'https://youtube.com' },
  { icon: Twitter, label: 'X', href: 'https://x.com' },
  { icon: Facebook, label: 'Facebook', href: 'https://facebook.com' },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com' },
  { icon: Github, label: 'GitHub', href: 'https://github.com/tehseen-ctrl' },
];

const COPY = {
  en: {
    tagline: 'Your camera is your trainer. Real-time form coaching, honest reps and a food plan built for the work you did.',
    newsTitle: 'Get the weekly training drop',
    newsBody: 'One short email — a new movement, a form tip and a recipe. No spam, unsubscribe anytime.',
    newsPlaceholder: 'you@email.com',
    newsButton: 'Subscribe',
    newsDone: "You're on the list. Talk soon.",
    columns: [
      {
        title: 'Product',
        links: [
          { kind: 'navigate', view: 'home', label: 'Dashboard' },
          { kind: 'navigate', view: 'nutrition', label: 'Fuel & Nutrition' },
          { kind: 'section', id: 'exercises', label: 'Exercises' },
          { kind: 'section', id: 'how', label: 'How it works' },
        ] as FooterLink[],
      },
      {
        title: 'Company',
        links: [
          { kind: 'section', id: 'features', label: 'About FIITEENESS' },
          { kind: 'section', id: 'how', label: 'How coaching works' },
          { kind: 'external', href: 'mailto:care@fiiteeness.app', label: 'Partner with us' },
        ] as FooterLink[],
      },
      {
        title: 'Legal',
        links: [
          { kind: 'legal', doc: 'privacy', label: 'Privacy Policy' },
          { kind: 'legal', doc: 'terms', label: 'Terms of Service' },
          { kind: 'external', href: 'mailto:care@fiiteeness.app', label: 'Data requests' },
        ] as FooterLink[],
      },
    ],
    careTitle: 'Customer care',
    careHours: 'Mon – Sat · 8am to 8pm IST',
    careEmail: 'care@fiiteeness.app',
    careChat: 'Chat on WhatsApp',
    socialTitle: 'Follow the journey',
    rights: 'All rights reserved.',
    built: 'Built as a final year project.',
    backTop: 'Back to top',
  },
  hi: {
    tagline: 'Aapka camera hi aapka trainer hai. Real-time form coaching, sahi reps aur aapki mehnat ke hisaab se food plan.',
    newsTitle: 'Weekly training update lo',
    newsBody: 'Ek chhota email — nayi exercise, ek form tip aur ek recipe. Koi spam nahi, kabhi bhi band karo.',
    newsPlaceholder: 'aap@email.com',
    newsButton: 'Subscribe',
    newsDone: 'Aap list me ho gaye. Jaldi baat karte hain.',
    columns: [
      {
        title: 'Product',
        links: [
          { kind: 'navigate', view: 'home', label: 'Dashboard' },
          { kind: 'navigate', view: 'nutrition', label: 'Fuel aur Nutrition' },
          { kind: 'section', id: 'exercises', label: 'Exercises' },
          { kind: 'section', id: 'how', label: 'Kaise chalta hai' },
        ] as FooterLink[],
      },
      {
        title: 'Company',
        links: [
          { kind: 'section', id: 'features', label: 'FIITEENESS ke baare me' },
          { kind: 'section', id: 'how', label: 'Coaching kaise kaam karti hai' },
          { kind: 'external', href: 'mailto:care@fiiteeness.app', label: 'Saath aao' },
        ] as FooterLink[],
      },
      {
        title: 'Legal',
        links: [
          { kind: 'legal', doc: 'privacy', label: 'Privacy Policy' },
          { kind: 'legal', doc: 'terms', label: 'Terms of Service' },
          { kind: 'external', href: 'mailto:care@fiiteeness.app', label: 'Data request' },
        ] as FooterLink[],
      },
    ],
    careTitle: 'Customer care',
    careHours: 'Somvaar – Shanivaar · 8am se 8pm IST',
    careEmail: 'care@fiiteeness.app',
    careChat: 'WhatsApp par baat karo',
    socialTitle: 'Jude raho',
    rights: 'Saare haq surakshit.',
    built: 'Final year project ke roop me bana.',
    backTop: 'Upar jao',
  },
};

export function SiteFooter({ language, onNavigate, onStart }: Props) {
  const t = COPY[language];
  const [legal, setLegal] = useState<LegalKind | null>(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else onStart?.();
  };

  const renderLink = (link: FooterLink, index: number) => {
    const shared =
      'group relative inline-flex items-center gap-2 text-[13px] text-slate-400 transition-colors hover:text-white';
    const dash = (
      <span className="h-px w-0 bg-emerald-400 transition-all duration-300 group-hover:w-4" />
    );

    if (link.kind === 'external') {
      return (
        <a key={`${link.label}-${index}`} href={link.href} className={shared}>
          {dash}
          {link.label}
        </a>
      );
    }

    return (
      <button
        key={`${link.label}-${index}`}
        onClick={() => {
          if (link.kind === 'navigate') {
            if (onNavigate) onNavigate(link.view);
            else onStart?.();
          } else if (link.kind === 'section') {
            jump(link.id);
          } else {
            setLegal(link.doc);
          }
        }}
        className={shared}
      >
        {dash}
        {link.label}
      </button>
    );
  };

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-ink">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 animate-glow-pulse rounded-full bg-emerald-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 animate-glow-pulse rounded-full bg-cyan-500/10 blur-[100px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-5 pb-8 pt-16 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          {/* Brand + newsletter */}
          <Reveal>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-sm font-black text-ink">
                F
              </span>
              <span className="text-sm font-extrabold tracking-[0.3em] text-white">FIITEENESS</span>
            </div>
            <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-slate-400">{t.tagline}</p>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-bold text-white">{t.newsTitle}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-slate-400">{t.newsBody}</p>
              {subscribed ? (
                <p className="mt-3 flex items-center gap-2 text-[13px] font-semibold text-emerald-300">
                  <Send className="h-3.5 w-3.5" />
                  {t.newsDone}
                </p>
              ) : (
                <form
                  className="mt-3 flex gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (email.trim()) setSubscribed(true);
                  }}
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={t.newsPlaceholder}
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-[13px] text-white outline-none transition focus:border-emerald-400/60"
                  />
                  <button
                    type="submit"
                    className="shine relative inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-4 py-2.5 text-[13px] font-bold text-ink transition hover:brightness-110"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {t.newsButton}
                  </button>
                </form>
              )}
            </div>
          </Reveal>

          {/* Link columns */}
          {t.columns.map((column, columnIndex) => (
            <Reveal key={column.title} delay={80 * (columnIndex + 1)}>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link, index) => (
                  <li key={`${column.title}-${index}`}>{renderLink(link, index)}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        {/* Customer care + socials */}
        <Reveal>
          <div className="mt-12 grid gap-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-2">
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">
                {t.careTitle}
              </h3>
              <div className="mt-3 space-y-2.5 text-[13px] text-slate-300">
                <a
                  href={`mailto:${t.careEmail}`}
                  className="group flex items-center gap-2.5 transition hover:text-white"
                >
                  <Mail className="h-4 w-4 text-emerald-400 transition group-hover:scale-110" />
                  {t.careEmail}
                </a>
                <a
                  href="https://wa.me/910000000000"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-2.5 transition hover:text-white"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-400 transition group-hover:scale-110" />
                  {t.careChat}
                </a>
                <p className="flex items-center gap-2.5 text-slate-400">
                  <Clock className="h-4 w-4 text-slate-500" />
                  {t.careHours}
                </p>
              </div>
            </div>

            <div className="sm:justify-self-end">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">
                {t.socialTitle}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {SOCIALS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="group flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-emerald-300"
                  >
                    <social.icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-center text-[11px] text-slate-500 sm:text-left">
            © {new Date().getFullYear()} FIITEENESS · {t.rights}{' '}
            <span className="text-slate-600">{t.built}</span>
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLegal('privacy')}
              className="flex items-center gap-1.5 text-[11px] text-slate-500 transition hover:text-emerald-300"
            >
              <Lock className="h-3.5 w-3.5" />
              Privacy
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => setLegal('terms')}
              className="flex items-center gap-1.5 text-[11px] text-slate-500 transition hover:text-emerald-300"
            >
              <FileText className="h-3.5 w-3.5" />
              Terms
            </button>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label={t.backTop}
              className="group ml-1 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-400 transition hover:border-emerald-400/40 hover:text-emerald-300"
            >
              <ArrowUp className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>

      <LegalModal
        open={legal !== null}
        kind={legal ?? 'privacy'}
        language={language}
        onClose={() => setLegal(null)}
      />
    </footer>
  );
}
