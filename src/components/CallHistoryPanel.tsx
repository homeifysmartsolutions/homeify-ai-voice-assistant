import React, { useState } from "react";
import { CallTranscriptItem } from "../types";
import { FolderHeart, Clock, BookOpen, Trash2, ChevronRight, FileSpreadsheet, Eye, Music } from "lucide-react";

interface CallHistoryItem {
  id: string;
  partnerName: string;
  date: string;
  duration: number; // in seconds
  transcriptCount: number;
  transcripts: CallTranscriptItem[];
}

interface CallHistoryPanelProps {
  history: CallHistoryItem[];
  onClearHistory: () => void;
  onSynthesizeSpeech: (text: string, langCode: string) => void;
}

export default function CallHistoryPanel({ history, onClearHistory, onSynthesizeSpeech }: CallHistoryPanelProps) {
  const [selectedItem, setSelectedItem] = useState<CallHistoryItem | null>(null);

  const formatDuration = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Metrics overview widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">Total Bridges Established</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-100">{history.length}</span>
            <span className="text-xs text-teal-400 font-bold font-mono">Active Sessions</span>
          </div>
          <p className="text-slate-405 text-xs">Accumulated dial connections across all regional nodes.</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">Dialogue Volume</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-100">
              {history.reduce((acc, curr) => acc + curr.transcriptCount, 0)}
            </span>
            <span className="text-xs text-indigo-400 font-bold font-mono">Phrases localized</span>
          </div>
          <p className="text-slate-405 text-xs">Phonetic guide maps compiled during active calls.</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <span className="text-[10px] font-mono uppercase tracking-widest text-teal-400 font-bold flex items-center gap-1">
            ✨ Voice Synthesizer
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-100 font-mono">Web Speech API</span>
          </div>
          <p className="text-slate-405 text-xs">Multi-accent tonal speech delivery powered directly by browser media output.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Archive Call Logs List */}
        <div className="lg:col-span-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <FolderHeart className="w-4 h-4 text-teal-400" /> Dialed Call Logs
              </h3>
              {history.length > 0 && (
                <button
                  id="clear-logs-btn"
                  onClick={onClearHistory}
                  className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold tracking-wider flex items-center gap-1 float-right cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Clear History
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No local transcripts stored. Call an AI companion to accumulate real-time translation logs.
              </div>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                {history.map((record) => (
                  <button
                    id={`record-log-btn-${record.id}`}
                    key={record.id}
                    onClick={() => setSelectedItem(record)}
                    className={`w-full text-left p-3.5 rounded-xl transition-all border flex items-center justify-between cursor-pointer ${
                      selectedItem?.id === record.id
                        ? "bg-teal-500/10 border-teal-500/30 text-white"
                        : "bg-black/20 border-transparent hover:bg-white/5 text-slate-400"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex gap-2 items-center">
                        <span className="font-bold text-xs text-slate-200">{record.partnerName}</span>
                        <span className="text-[9px] bg-black/40 border border-white/5 px-2 py-0.5 rounded text-teal-400 font-mono">
                          {formatDuration(record.duration)}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">{record.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-slate-500">
                        {record.transcriptCount} lines
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-605" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="border-t border-white/5 pt-3 text-slate-500 text-[10px] select-none text-left font-mono leading-relaxed bg-black/20 p-3 rounded-xl mt-3">
            🔒 Privacy Policy: Transcripts are stored locally in state cache and are cleared on tab refresh or clear trigger. Call logs never transfer to external metrics unless downloaded.
          </div>
        </div>

        {/* Archives details */}
        <div className="lg:col-span-7">
          {selectedItem ? (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4 animate-fadeIn">
              <div className="flex justify-between items-start border-b border-white/5 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-200 flex items-center gap-2 font-sans">
                    {selectedItem.partnerName} Call Record
                  </h3>
                  <div className="flex gap-3 text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-wider">
                    <span>{selectedItem.date}</span>
                    <span>•</span>
                    <span>Duration: {formatDuration(selectedItem.duration)}</span>
                  </div>
                </div>
                <span className="text-xs font-mono bg-teal-500/10 text-teal-300 font-semibold px-2.5 py-1 rounded-full border border-teal-500/20 shadow-[0_0_8px_rgba(45,212,191,0.1)]">
                  {selectedItem.transcriptCount} Lines Localized
                </span>
              </div>

              {/* Conversation items list */}
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                {selectedItem.transcripts.map((item, idx) => (
                  <div key={idx} className="bg-black/25 border border-white/5 rounded-xl p-3 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                      <span>{item.speaker === "user" ? "You (User)" : selectedItem.partnerName}</span>
                      <span>{item.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-400 italic">"{item.originalText}"</p>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-teal-100 pb-1">
                      <ChevronRight className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span className="flex-1">{item.translatedText}</span>
                      <button
                        id={`synthesize-archive-phr-${idx}`}
                        onClick={() => onSynthesizeSpeech(item.translatedText, "en-US")}
                        className="text-slate-400 hover:text-teal-300 transition-colors p-1 cursor-pointer"
                        title="Replay translated audio speak"
                      >
                        <Music className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full bg-white/[0.02] border border-white/10 border-dashed rounded-2xl flex flex-col items-center justify-center text-center p-8 text-slate-500 min-h-[300px]">
              <Eye className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-400">Select Call Record</p>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Select a Call Log card from the left panel to unpack full-sentence transcripts, phonetic spelling, and audio replay capabilities.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
