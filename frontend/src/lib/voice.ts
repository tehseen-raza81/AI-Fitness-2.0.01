/**
 * Bilingual voice coach built on the Web Speech API.
 * Announces form warnings, rep counts and completion out loud so the user can
 * train without looking at the screen.
 */

import type { Language } from '../types';

const NUMBERS_EN = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen', 'twenty',
];

const NUMBERS_HI = [
  'shunya', 'ek', 'do', 'teen', 'chaar', 'paanch', 'chhah', 'saat', 'aath', 'nau',
  'das', 'gyarah', 'barah', 'terah', 'chaudah', 'pandrah', 'solah', 'satrah',
  'atharah', 'unnis', 'bees',
];

function numberToWords(value: number, language: Language): string {
  const table = language === 'hi' ? NUMBERS_HI : NUMBERS_EN;
  if (value >= 0 && value < table.length) return table[value];
  return String(value);
}

export class VoiceCoach {
  private language: Language;
  private enabled = true;
  private lastSpokenAt = new Map<string, number>();
  private lastUrgentAt = 0;
  private voice: SpeechSynthesisVoice | null = null;
  private repeatWindowMs = 4000;
  private urgentWindowMs = 2200;

  constructor(language: Language) {
    this.language = language;
    this.attachVoice();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => this.attachVoice();
    }
  }

  setLanguage(language: Language): void {
    this.language = language;
    this.attachVoice();
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.stop();
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  private attachVoice(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    const preferred = this.language === 'hi' ? ['hi-IN', 'hi'] : ['en-US', 'en-GB', 'en-IN', 'en'];
    for (const tag of preferred) {
      const match = voices.find((v) => v.lang.toLowerCase().startsWith(tag.toLowerCase()));
      if (match) {
        this.voice = match;
        return;
      }
    }
  }

  stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  private speak(text: string, key: string, urgent: boolean): void {
    if (!this.enabled || !text) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const now = Date.now();
    const windowMs = urgent ? this.urgentWindowMs : this.repeatWindowMs;

    const last = this.lastSpokenAt.get(key) ?? 0;
    if (now - last < windowMs) return;
    if (urgent && now - this.lastUrgentAt < 900) return;

    this.lastSpokenAt.set(key, now);
    if (urgent) this.lastUrgentAt = now;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = urgent ? 1.12 : 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    if (this.voice) utterance.voice = this.voice;

    // Cancel stale speech so corrections stay immediate.
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  /** Loud correction for a wrong posture. */
  warn(messageEn: string, messageHi: string): void {
    if (this.language === 'hi') {
      this.speak(`Ye galat hai. ${messageHi}`, `warn:${messageHi}`, true);
    } else {
      this.speak(`This is wrong. ${messageEn}`, `warn:${messageEn}`, true);
    }
  }

  /** Softer nudge when the rep is still valid but not perfect. */
  caution(messageEn: string, messageHi: string): void {
    if (this.language === 'hi') {
      this.speak(messageHi, `caution:${messageHi}`, false);
    } else {
      this.speak(messageEn, `caution:${messageEn}`, false);
    }
  }

  /** Encourage when the position is right. */
  praise(): void {
    const en = ['Good, keep it up.', 'Perfect form, hold it.', 'Nice, that is correct.'];
    const hi = ['Shabash, isi tarah karo.', 'Perfect form hai, hold karo.', 'Badiya, sahi kar rahe ho.'];
    const list = this.language === 'hi' ? hi : en;
    const pickIndex = Math.floor(Math.random() * list.length);
    this.speak(list[pickIndex], `praise:${pickIndex}`, false);
  }

  countRep(count: number): void {
    const word = numberToWords(count, this.language);
    const text = this.language === 'hi' ? `${word} ho gaya` : `${word}`;
    this.speak(text, `rep:${count}`, true);
  }

  rejectedRep(): void {
    if (this.language === 'hi') {
      this.speak('Ye repetition count nahi hui. Form sahi karo.', 'rejected', true);
    } else {
      this.speak('That repetition did not count. Fix your form.', 'rejected', true);
    }
  }

  fullBodyReminder(): void {
    if (this.language === 'hi') {
      this.speak('Poora shareer camera me dikhao.', 'fullbody', false);
    } else {
      this.speak('Show your full body in the camera.', 'fullbody', false);
    }
  }

  complete(exerciseName: string): void {
    if (this.language === 'hi') {
      this.speak(`Task complete. ${exerciseName} poora ho gaya. Shabash!`, 'complete', true);
    } else {
      this.speak(`Task complete. You finished ${exerciseName}. Well done!`, 'complete', true);
    }
  }
}
