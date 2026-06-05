import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import CallInterface from "./components/CallInterface";
import SlangPlayground from "./components/SlangPlayground";
import CallHistoryPanel from "./components/CallHistoryPanel";
import { SEED_PARTNERS, SEED_DIALECTS } from "./data";
import { CallPartner, Dialect, CallTranscriptItem } from "./types";
import { PhoneCall, BookOpen, Clock, Users, ArrowRight, CornerDownRight, Volume2, Sparkles, MessageCircleCode } from "lucide-react";

interface CallHistoryRecord {
  id: string;
  partnerName: string;
  date: string;
  duration: number;
  transcriptCount: number;
  transcripts: CallTranscriptItem[];
}

export default function App() {
  const [activeTab, setActiveTab] = useState<"call" | "dictionary" | "history">("call");
  
  // Selected companion partner state
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("partner-rajesh");
  const activePartner = SEED_PARTNERS.find((p) => p.id === selectedPartnerId) || SEED_PARTNERS[0];
  const activeDialect = SEED_DIALECTS[activePartner.dialect] || SEED_DIALECTS["hi-Bhojpuri"];

  // Core noise level simulation metric
  const [noiseLevel, setNoiseLevel] = useState<"quiet" | "medium" | "noisy">("quiet");
  const [latencyMs, setLatencyMs] = useState<number>(120);

  // Saved call history state with styled mock starter entries to make the app's history panel look premium right out of the box
  const [callHistory, setCallHistory] = useState<CallHistoryRecord[]>([
    {
      id: "hist-1",
      partnerName: "Rajesh Kumar",
      date: "Heard yesterday at 03:22 PM",
      duration: 145,
      transcriptCount: 4,
      transcripts: [
        {
          id: "m1",
          speaker: "partner",
          originalText: "प्रणाम भैया! रउआ सब खैरियत बा? का हाल बा?",
          translatedText: "Greeting brother! Is everything fine with you? How are things?",
          pinyinOrPhonetic: "Pranam bhaiya! Raua sab khairiyat ba? Kaa haal ba?",
          culturalNote: "Traditional Bhojpuri welcome focuses on mutual welfare and respecting seniority.",
          timestamp: "03:22 PM"
        },
        {
          id: "m2",
          speaker: "user",
          originalText: "Hello Rajesh! The organic seeds are growing wonderfully. Thank you.",
          translatedText: "हेलो राजेश! जैविक बीज बहुत बढ़िया से बढ़ता बा।  रउआ के धन्यवाद।",
          pinyinOrPhonetic: "Hello Rajesh! Jaivik beej bahut badhiya se badhta ba. Raua ke dhanyavad.",
          culturalNote: "Simulates rural agricultural dialogue with regional Bhojpuri terms.",
          timestamp: "03:23 PM"
        },
        {
          id: "m3",
          speaker: "partner",
          originalText: "अरे वाह! सुन के बहुत आनंद भईल। पानी पटावे के नियम याद बा नू?",
          translatedText: "Oh awesome! Hearing that brings sheer joy. Do you remember the irrigation calendar schedules?",
          pinyinOrPhonetic: "Are wah! Sun ke bahut aanand bhail. Paani patave ke niyam yaad ba nu?",
          culturalNote: "'Paani patave' literally translates as irrigation/watering the crops in local dialect.",
          timestamp: "03:24 PM"
        },
        {
          id: "m4",
          speaker: "user",
          originalText: "Yes, I am watering them according to the guide.",
          translatedText: "हाँ, हम गाइड के अनुसार पानी पटावत बानी।",
          pinyinOrPhonetic: "Haan, hum guide ke anusar paani patawat bani.",
          culturalNote: "Earthy and colloquial, uses respectful 'Bani' verb ending.",
          timestamp: "03:24 PM"
        }
      ]
    },
    {
      id: "hist-2",
      partnerName: "Yuki Tanaka",
      date: "Heard June 3, 2026",
      duration: 90,
      transcriptCount: 2,
      transcripts: [
        {
          id: "y1",
          speaker: "partner",
          originalText: "まいど！元気にしてる？たこ焼き食べていかへん？",
          translatedText: "Hello there! Doing well? Won't you grab some hot takoyaki?",
          pinyinOrPhonetic: "Maido! Genki ni shiteru? Takoyaki tabete ikahen?",
          culturalNote: "Osaka street merchants greet patrons with 'Maido' instead of 'Konnichiwa'.",
          timestamp: "11:40 AM"
        },
        {
          id: "y2",
          speaker: "user",
          originalText: "Your street food stall is absolute heaven, thank you!",
          translatedText: "あんたの屋台はめっちゃ天国やわ、おおきに！",
          pinyinOrPhonetic: "Anta no yatai wa metcha tengoku yawa, ookini!",
          culturalNote: "Uses 'Metcha' (very) and 'Ookini' (thank you) in classic Kansai style.",
          timestamp: "11:41 AM"
        }
      ]
    }
  ]);

  // Adjust latency based on simulated background noise environments
  useEffect(() => {
    if (noiseLevel === "quiet") {
      setLatencyMs(88);
    } else if (noiseLevel === "medium") {
      setLatencyMs(142);
    } else {
      setLatencyMs(210);
    }
  }, [noiseLevel]);

  // Core Speech Synthesis (Text-to-Speech) module
  const handleSynthesizeSpeech = (text: string, langCode: string) => {
    if (!window.speechSynthesis) return;

    // Halt current speaking sounds
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;

    // Dialect specific accent matching via browser system voices
    const voices = window.speechSynthesis.getVoices();
    
    // Select the best voice match if matching exists
    const matchingVoice = voices.find((v) => {
      const vLang = v.lang.toLowerCase();
      const code = langCode.toLowerCase();
      return vLang.includes(code) || code.includes(vLang);
    });

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    // Dialect speeds customized for native feel
    if (langCode.includes("hi")) {
      utterance.rate = 0.9; // Hindi is clearer slower
      utterance.pitch = 0.95;
    } else if (langCode.includes("ja")) {
      utterance.rate = 1.05; // Kansai is quick and melodic
      utterance.pitch = 1.1;
    } else if (langCode.includes("es")) {
      utterance.rate = 0.95; 
      utterance.pitch = 1.0;
    } else {
      utterance.rate = 1.0;
    }

    window.speechSynthesis.speak(utterance);
  };

  // Add a call record to history list
  const handleAddHistoryRecord = (partnerName: string, transcripts: CallTranscriptItem[], duration: number) => {
    if (transcripts.length === 0) return;
    const newRecord: CallHistoryRecord = {
      id: "hist-" + Date.now(),
      partnerName,
      date: `Heard today at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      duration,
      transcriptCount: transcripts.length,
      transcripts
    };
    setCallHistory((prev) => [newRecord, ...prev]);
  };

  const handleClearHistory = () => {
    setCallHistory([]);
  };

  // Trigger quick dialect set from dictionary panel
  const handleSelectDialectFromDictionary = (dialectCode: string) => {
    const matchingPartner = SEED_PARTNERS.find((p) => p.dialect === dialectCode);
    if (matchingPartner) {
      setSelectedPartnerId(matchingPartner.id);
      setActiveTab("call");
      handleSynthesizeSpeech(`Active call companion updated to ${matchingPartner.name}. Ready to dial.`, "en-US");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#05070A] text-slate-100 selection:bg-teal-500 selection:text-slate-950 font-sans antialiased pb-12 relative overflow-hidden">
      
      {/* Atmospheric Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-900/10 blur-[130px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/10 blur-[130px] rounded-full"></div>
      </div>

      {/* Header Metric bar */}
      <Header 
        noiseLevel={noiseLevel} 
        setNoiseLevel={setNoiseLevel} 
        latencyMs={latencyMs} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 relative z-10">
        
        {/* TAB CONTROLLER NAVIGATION BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-2.5 rounded-2xl">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              id="tab-call"
              onClick={() => setActiveTab("call")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-2 ${
                activeTab === "call"
                  ? "bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-lg shadow-teal-500/20 scale-[1.02]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" /> Direct Call Dialer
            </button>
            <button
              id="tab-dict"
              onClick={() => setActiveTab("dictionary")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-2 ${
                activeTab === "dictionary"
                  ? "bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-lg shadow-teal-500/20 scale-[1.02]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Dialect Slang Center
            </button>
            <button
              id="tab-hist"
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-2 ${
                activeTab === "history"
                  ? "bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-lg shadow-teal-500/20 scale-[1.02]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Call Logs & Transcripts
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Users className="w-4 h-4 text-teal-400" /> Active Companions: <span className="text-teal-400 font-bold">{SEED_PARTNERS.length} online</span>
          </div>
        </div>

        {/* COMPANION DIRECTORY - CHOOSE AGENT CAROUSEL */}
        {activeTab === "call" && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-400 animate-spin duration-3000" /> Select AI Dialect Companion
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">Choose an AI partner with a specific regional dialect pattern to establish a dynamic translated conversation link.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {SEED_PARTNERS.map((partner) => {
                const isSelected = selectedPartnerId === partner.id;
                const partnerDialect = SEED_DIALECTS[partner.dialect];
                
                return (
                  <button
                    id={`companion-card-${partner.id}`}
                    key={partner.id}
                    onClick={() => {
                      setSelectedPartnerId(partner.id);
                      handleSynthesizeSpeech(`Active speaker mapped to ${partner.name}. Let's discuss.`, "en-US");
                    }}
                    className={`text-left p-4 rounded-2xl transition-all border outline-none cursor-pointer flex flex-col justify-between ${
                      isSelected 
                        ? "bg-gradient-to-br from-white/10 to-transparent border-teal-500/80 shadow-xl shadow-teal-500/10 scale-[1.01]" 
                        : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <img 
                          src={partner.avatar} 
                          alt={partner.name} 
                          className="w-12 h-12 rounded-xl object-cover border border-white/10 shadow-md flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <span className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded text-white ${partner.avatarColor}`}>
                          {partnerDialect?.name.split(" ")[0]}
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="font-bold text-xs text-slate-200 line-clamp-1">{partner.name}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-mono leading-none">{partner.languageName}</p>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-2 leading-relaxed border-t border-white/5 pt-2 italic">
                      "{partner.backstory}"
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* MAIN PANEL CONDITIONAL RENDERS */}
        <div className="animate-fadeIn">
          {activeTab === "call" && (
            <CallInterface 
              partner={activePartner} 
              partnerDialect={activeDialect} 
              noiseLevel={noiseLevel}
              onAddHistory={handleAddHistoryRecord}
              onSynthesizeSpeech={handleSynthesizeSpeech}
            />
          )}

          {activeTab === "dictionary" && (
            <SlangPlayground 
              onSelectDialect={handleSelectDialectFromDictionary}
              onSynthesizeSpeech={handleSynthesizeSpeech}
            />
          )}

          {activeTab === "history" && (
            <CallHistoryPanel 
              history={callHistory}
              onClearHistory={handleClearHistory}
              onSynthesizeSpeech={handleSynthesizeSpeech}
            />
          )}
        </div>
      </main>
    </div>
  );
}
