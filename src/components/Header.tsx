import React from "react";
import { Cpu, Wifi, Activity, VolumeX, ShieldAlert } from "lucide-react";

interface HeaderProps {
  noiseLevel: "quiet" | "medium" | "noisy";
  setNoiseLevel: (level: "quiet" | "medium" | "noisy") => void;
  latencyMs: number;
}

export default function Header({ noiseLevel, setNoiseLevel, latencyMs }: HeaderProps) {
  return (
    <header className="bg-black/30 backdrop-blur-md border-b border-white/5 px-6 py-4 flex flex-wrap gap-4 items-center justify-between text-slate-100 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse shadow-[0_0_12px_rgba(45,212,191,0.6)]"></div>
        </div>
        <div>
          <h1 className="text-xs font-bold uppercase tracking-widest text-teal-400/80">Live VoIP Translation</h1>
          <p className="text-base font-semibold text-slate-200">Veloce AI Bridge <span className="text-slate-400 font-mono font-normal">| {latencyMs}ms Latency</span></p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 text-xs text-[#ced4da]">
        <div className="hover:bg-white/5 p-2 rounded-lg transition-colors flex items-center gap-2 border border-transparent hover:border-white/5">
          <Cpu className="w-4 h-4 text-teal-400" />
          <div>
            <div className="text-[9px] text-slate-500 font-mono">CORE ENGINE</div>
            <div className="font-semibold font-mono text-xs">Gemini 3.5 Flash</div>
          </div>
        </div>

        {/* Noise level simulator widget */}
        <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex items-center gap-1">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 font-mono px-2">Noise Filter</span>
          <button
            id="noise-quiet"
            onClick={() => setNoiseLevel("quiet")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              noiseLevel === "quiet"
                ? "bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-[0_0_8px_rgba(45,212,191,0.2)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Quiet
          </button>
          <button
            id="noise-medium"
            onClick={() => setNoiseLevel("medium")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              noiseLevel === "medium"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Market
          </button>
          <button
            id="noise-heavy"
            onClick={() => setNoiseLevel("noisy")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              noiseLevel === "noisy"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Traffic
          </button>
        </div>
      </div>
    </header>
  );
}
