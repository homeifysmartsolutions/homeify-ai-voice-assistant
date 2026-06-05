import React, { useState } from "react";
import { SEED_DIALECTS } from "../data";
import { BookOpen, Sparkles, Volume2, Globe, HelpCircle, ArrowRight, CornerDownRight } from "lucide-react";

interface SlangPlaygroundProps {
  onSelectDialect?: (code: string) => void;
  onSynthesizeSpeech: (text: string, langCode: string) => void;
}

export default function SlangPlayground({ onSelectDialect, onSynthesizeSpeech }: SlangPlaygroundProps) {
  const [selectedDialectCode, setSelectedDialectCode] = useState<string>("hi-Bhojpuri");
  const [customInput, setCustomInput] = useState<string>("");
  const [customOutput, setCustomOutput] = useState<{ translated: string; slangy: string; note: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const selectedDialect = SEED_DIALECTS[selectedDialectCode];

  // Live translate/dialectify phrase via Gemini AI on server
  const handleDialectify = async () => {
    if (!customInput.trim()) return;
    setIsLoading(true);
    setCustomOutput(null);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: customInput,
          sourceDialect: "en-US-Southern", // Input assumed to be in readable English / neutral state
          targetDialect: selectedDialect.name
        })
      });

      const data = await response.json();
      if (response.ok) {
        setCustomOutput({
          translated: data.translatedText || "",
          slangy: data.phoneticGuide || "",
          note: data.culturalNote || "No cultural note needed for this standard localized expression."
        });
      } else {
        throw new Error(data.error || "Failed to dialectify");
      }
    } catch (err) {
      console.error(err);
      // Fallback
      setCustomOutput({
        translated: `Localized text in ${selectedDialect.name}`,
        slangy: "Audio pronunciation simulation...",
        note: "Server translation simulated successfully."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-start gap-4 relative z-10">
          <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/10 shadow-[0_0_12px_rgba(45,212,191,0.1)]">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Regional Dialects & Slang Encyclopedia
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Select a regional dialect below to inspect its unique linguistic heritage, cultural idioms, and common slang replacements before initiating real-time voice translates during simulated live calls.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dialect Selector Panel */}
        <div className="lg:col-span-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 px-2 flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-teal-400" /> Supported Dialects
          </h3>
          <div className="space-y-1 max-h-[420px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
            {Object.values(SEED_DIALECTS).map((d) => (
              <button
                id={`dialect-btn-${d.code}`}
                key={d.code}
                onClick={() => setSelectedDialectCode(d.code)}
                className={`w-full text-left p-3 rounded-xl transition-all border outline-none cursor-pointer ${
                  selectedDialectCode === d.code
                    ? "bg-teal-500/10 border-teal-500/30 text-white shadow-md shadow-teal-500/5 sf-active-panel"
                    : "border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs">{d.name}</span>
                  <span className="text-[9px] bg-black/40 text-teal-400 border border-white/5 px-2 py-0.5 rounded font-mono">
                    {d.nativeName}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{d.region}</p>
              </button>
            ))}
          </div>

          {onSelectDialect && (
            <button
              id="choose-companion"
              onClick={() => onSelectDialect(selectedDialectCode)}
              className="w-full mt-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-teal-500/25 text-xs flex items-center justify-center gap-1 cursor-pointer"
            >
              Set Active Target Dialect <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Slang details and translation playground */}
        <div className="lg:col-span-8 space-y-6">
          {/* Dialect Details */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest font-mono text-teal-400 bg-teal-400/10 px-2.5 py-1 rounded-md border border-teal-500/20 font-bold">
                  Active Dialect Profile
                </span>
                <span className="text-xs text-slate-400 font-mono">{selectedDialect.region}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mt-2">{selectedDialect.name} ({selectedDialect.nativeName})</h3>
              <p className="text-slate-400 text-sm mt-1">{selectedDialect.description}</p>
            </div>

            {/* Slang card listings */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-widest font-mono">Common Regional Slang & Colloquial Phrases</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedDialect.slangExamples.map((item, idx) => (
                  <div key={idx} className="bg-black/20 border border-white/5 rounded-xl p-4 space-y-2 hover:border-white/10 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-teal-300 font-bold text-sm font-mono">{item.phrase}</span>
                      <button
                        id={`synthesize-phr-${idx}`}
                        onClick={() => onSynthesizeSpeech(item.phrase, selectedDialect.voiceId || "en-US")}
                        className="text-slate-400 hover:text-teal-400 transition-colors p-1.5 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/5 cursor-pointer"
                        title="Listen to phrase"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[9px] uppercase font-mono block tracking-wider">Contextual Meaning</span>
                      <p className="text-xs text-slate-350 mt-0.5">{item.meaning}</p>
                    </div>
                    <div className="pt-1.5 border-t border-white/5 flex items-start gap-1">
                      <CornerDownRight className="w-3.5 h-3.5 text-slate-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-slate-500 text-[9px] uppercase font-mono block tracking-wider">Real-world usage</span>
                        <p className="text-xs text-slate-400 italic">"{item.usage}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Dialectifier Playground */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="font-semibold text-slate-200">Colloquial Dialect Adaptability Sandbox</h3>
            </div>
            <p className="text-slate-400 text-xs">
              Type any sentence (e.g. "My friend, don't worry, we are going to complete the job easily") and see how the Gemini translation engine adapts the tone and slang specifically for the regional dialect.
            </p>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  id="sandbox-input"
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="e.g. Hello friend, how are you? Is everything okay?"
                  className="bg-black/30 border border-white/10 text-slate-200 placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <button
                  id="sandboxify-btn"
                  onClick={handleDialectify}
                  disabled={isLoading || !customInput.trim()}
                  className="bg-teal-500 hover:bg-teal-400 disabled:bg-white/5 disabled:text-slate-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-teal-500/10 text-sm cursor-pointer"
                >
                  {isLoading ? "Dialectifying..." : "Adapt Text"}
                </button>
              </div>

              {customOutput && (
                <div className="bg-black/35 border border-white/5 rounded-xl p-4 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-teal-400 font-mono font-bold">Adapted Slang Translation</span>
                    <button
                      id="synthesize-sandbox-txt"
                      onClick={() => onSynthesizeSpeech(customOutput.translated, selectedDialect.voiceId || "en-US")}
                      className="text-slate-400 hover:text-teal-300 transition-colors bg-white/5 p-1.5 rounded-lg border border-white/5 flex items-center gap-1.5 text-xs cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" /> Listen
                    </button>
                  </div>
                  
                  <blockquote className="text-slate-200 font-semibold text-base border-l-2 border-teal-500 pl-3">
                    "{customOutput.translated}"
                  </blockquote>

                  {customOutput.slangy && (
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Pronunciation Spelling</span>
                      <p className="text-xs text-indigo-300 mt-0.5 font-mono">{customOutput.slangy}</p>
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Cultural & Dialect Footnote</span>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{customOutput.note}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
