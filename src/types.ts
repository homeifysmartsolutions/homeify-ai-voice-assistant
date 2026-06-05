export interface Dialect {
  code: string;
  name: string;
  nativeName: string;
  region: string;
  description: string;
  slangExamples: Array<{ phrase: string; meaning: string; usage: string }>;
  voiceId?: string; // For SpeechSynthesis language/accent selection
  accentPrefix?: string; // Speech synthesis accent hints
}

export interface CallPartner {
  id: string;
  name: string;
  avatar: string;
  dialect: string; // Dialect code
  languageName: string;
  backstory: string;
  greeting: string;
  gender: "male" | "female";
  avatarColor: string;
}

export interface CallTranscriptItem {
  id: string;
  speaker: "user" | "partner";
  originalText: string;
  translatedText: string;
  pinyinOrPhonetic?: string;
  culturalNote?: string;
  audioUrl?: string; // Optional generated TTS audio
  timestamp: string;
}

export interface CallDetails {
  id: string;
  partner: CallPartner;
  partnerDialect: Dialect;
  userLanguage: string;
  userDialect: string;
  status: "idle" | "ringing" | "connected" | "ended";
  duration: number; // in seconds
  audioTranscripts: CallTranscriptItem[];
}

export interface DialectAnalysis {
  translatedText: string;
  phoneticGuide?: string;
  culturalNote?: string;
  colloquialAlternates?: string[];
  toneExplanation?: string;
}
