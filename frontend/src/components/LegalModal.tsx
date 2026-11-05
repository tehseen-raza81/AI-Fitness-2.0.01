/** Animated modal that renders the Privacy Policy or Terms of Service. */

import { useEffect } from 'react';
import { Lock, ShieldAlert, X } from 'lucide-react';
import type { Language } from '../types';

export type LegalKind = 'privacy' | 'terms';

interface Props {
  open: boolean;
  kind: LegalKind;
  language: Language;
  onClose: () => void;
}

interface Doc {
  title: string;
  updated: string;
  intro: string;
  sections: { heading: string; body: string }[];
}

const PRIVACY: { en: Doc; hi: Doc } = {
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: November 2025',
    intro:
      'FIITEENESS runs entirely on your own machine. This page explains exactly what we handle and, more importantly, what we never touch.',
    sections: [
      {
        heading: 'What we store',
        body: 'Only what you type in: your name, age, gender, height, weight, activity level, goal and coaching language. We also store a summary of each finished session — exercise, reps, form score, duration and calories.',
      },
      {
        heading: 'Your camera and pose data',
        body: 'Video frames are processed inside your browser by MediaPipe. We compute joint angles on the spot to coach you and then throw the frames away. No image or video is ever uploaded, recorded or saved.',
      },
      {
        heading: 'Where your data lives',
        body: 'Everything is kept in a local SQLite database on the same computer that runs the app. There is no cloud account, no third-party analytics and no tracking pixel.',
      },
      {
        heading: 'What we never do',
        body: 'We never sell, rent or share your data. We never record your camera. We never send your profile or workout history to an external server.',
      },
      {
        heading: 'Your control',
        body: 'You can edit or reset your profile at any time from the dashboard. Deleting the local database file permanently erases your entire history.',
      },
      {
        heading: 'Questions',
        body: 'Reach out any time at care@fiiteeness.app and we will get back to you.',
      },
    ],
  },
  hi: {
    title: 'Privacy Policy',
    updated: 'Aakhri update: November 2025',
    intro:
      'FIITEENESS poori tarah aapke apne computer par chalta hai. Ye page batata hai ki hum kya handle karte hain aur — sabse zaroori — kya kabhi nahi chhoote.',
    sections: [
      {
        heading: 'Hum kya store karte hain',
        body: 'Sirf wahi jo aap bharte ho: naam, umar, gender, lambai, wazan, activity level, goal aur coaching ki bhasha. Har poore hue session ka summary bhi — exercise, reps, form score, duration aur calories.',
      },
      {
        heading: 'Aapka camera aur pose data',
        body: 'Video frames aapke browser ke andar hi MediaPipe se process hote hain. Hum turant joint angles nikaal kar coaching karte hain aur frames chhod dete hain. Koi photo ya video kabhi upload, record ya save nahi hota.',
      },
      {
        heading: 'Data kahan rehta hai',
        body: 'Sab kuch usi computer par local SQLite database me rehta hai jahan app chalta hai. Koi cloud account nahi, koi third-party analytics nahi, koi tracking nahi.',
      },
      {
        heading: 'Hum kabhi nahi karte',
        body: 'Hum aapka data kabhi bechte, kiraye par dete ya share nahi karte. Camera record nahi karte. Profile ya history kisi bahar wale server par nahi bhejte.',
      },
      {
        heading: 'Aapka control',
        body: 'Dashboard se kabhi bhi profile edit ya reset kar sakte ho. Local database file delete karne par poori history hamesha ke liye mit jaati hai.',
      },
      {
        heading: 'Sawaal',
        body: 'Kabhi bhi care@fiiteeness.app par likh sakte ho, hum jaldi jawab denge.',
      },
    ],
  },
};

const TERMS: { en: Doc; hi: Doc } = {
  en: {
    title: 'Terms of Service',
    updated: 'Last updated: November 2025',
    intro:
      'By using FIITEENESS you agree to the terms below. Please read the safety section carefully — it matters more than everything else here.',
    sections: [
      {
        heading: 'Using the app',
        body: 'FIITEENESS is a personal fitness companion. You are responsible for training in a safe space and for entering honest body details, because every calculation depends on them.',
      },
      {
        heading: 'Not medical advice',
        body: 'This app is not a doctor, physiotherapist or dietitian. Its feedback is general guidance. Consult a qualified professional before starting any programme, and stop immediately if you feel pain, dizziness or shortness of breath.',
      },
      {
        heading: 'Limits of the AI coach',
        body: 'Pose estimates come from a camera model and can be affected by lighting, clothing or camera angle. A good form score is not a guarantee of safety — always train within your ability.',
      },
      {
        heading: 'Nutrition guidance',
        body: 'Meal and supplement suggestions are general information, not a prescription. If you have an allergy, medical condition, are pregnant or take medication, check with a doctor or dietitian first. Never start a supplement based on this app alone.',
      },
      {
        heading: 'Availability and liability',
        body: 'The software is provided as-is for educational use. We are not liable for injuries, losses or damages arising from its use. You train at your own risk.',
      },
      {
        heading: 'Changes',
        body: 'These terms may be updated as the project grows. Continued use means you accept the latest version.',
      },
    ],
  },
  hi: {
    title: 'Terms of Service',
    updated: 'Aakhri update: November 2025',
    intro:
      'FIITEENESS use karne par aap neeche di gayi shartein maante ho. Safety wala section dhyaan se padho — yahi sabse zaroori hai.',
    sections: [
      {
        heading: 'App ka use',
        body: 'FIITEENESS ek personal fitness companion hai. Safe jagah par train karna aur sahi body details bharna aapki zimmedari hai, kyunki har calculation inhi par depend karta hai.',
      },
      {
        heading: 'Ye medical advice nahi hai',
        body: 'Ye app doctor, physiotherapist ya dietitian nahi hai. Iska feedback general guidance hai. Koi bhi programme shuru karne se pehle qualified professional se milein, aur dard, chakkar ya saans phoolne par turant roko.',
      },
      {
        heading: 'AI coach ki limits',
        body: 'Pose estimates camera model se aate hain, jin par roshni, kapde ya camera angle ka asar hota hai. Achha form score safety ki guarantee nahi hai — apni capacity me train karo.',
      },
      {
        heading: 'Nutrition guidance',
        body: 'Meal aur supplement suggestions general information hain, prescription nahi. Agar allergy, medical condition hai, pregnancy hai ya dawai le rahe ho, pehle doctor ya dietitian se pucho. Sirf is app ke bharose supplement shuru na karo.',
      },
      {
        heading: 'Availability aur liability',
        body: 'Ye software educational use ke liye as-is diya gaya hai. Iske use se hone wali chot, nuksan ya loss ke liye hum zimmedar nahi hain. Training apne risk par karo.',
      },
      {
        heading: 'Badlav',
        body: 'Project badhne ke saath ye terms update ho sakti hain. Aage use karna matlab aap latest version maante ho.',
      },
    ],
  },
};

export function LegalModal({ open, kind, language, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const doc = (kind === 'privacy' ? PRIVACY : TERMS)[language];
  const Icon = kind === 'privacy' ? Lock : ShieldAlert;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 animate-fade-in bg-ink/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={doc.title}
        className="relative flex max-h-[90vh] w-full max-w-2xl animate-fade-up flex-col overflow-hidden rounded-t-[1.75rem] border border-white/10 bg-surface shadow-2xl shadow-black/60 sm:rounded-[1.75rem]"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 animate-glow-pulse rounded-full bg-emerald-500/20 blur-[80px]" />

        <header className="relative flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-display text-2xl text-white">{doc.title}</h2>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{doc.updated}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-slate-400 transition hover:rotate-90 hover:border-white/20 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="relative overflow-y-auto px-6 py-6">
          <p className="text-sm leading-relaxed text-slate-300">{doc.intro}</p>
          <div className="mt-6 space-y-5">
            {doc.sections.map((section, index) => (
              <div
                key={section.heading}
                className="animate-fade-up rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <h3 className="text-sm font-bold text-white">{section.heading}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{section.body}</p>
              </div>
            ))}
          </div>
        </div>

        <footer className="relative border-t border-white/10 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-5 py-3 text-sm font-bold text-ink transition hover:brightness-110"
          >
            {language === 'hi' ? 'Samajh gaya' : 'Got it'}
          </button>
        </footer>
      </div>
    </div>
  );
}
