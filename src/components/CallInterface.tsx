import React, { useState, useEffect, useRef } from "react";
import { CallPartner, Dialect, CallTranscriptItem, DialectAnalysis } from "../types";
import { SEED_DIALECTS } from "../data";
import { 
  PhoneCall, PhoneOff, Mic, MicOff, Volume2, 
  Download, Clock, Languages, ChevronRight, HelpCircle, 
  MessageSquareCode, Play, AlertCircle, Sparkles
} from "lucide-react";

interface CallInterfaceProps {
  partner: CallPartner;
  partnerDialect: Dialect;
  noiseLevel: "quiet" | "medium" | "noisy";
  onAddHistory: (partnerName: string, transcript: CallTranscriptItem[], duration: number) => void;
  onSynthesizeSpeech: (text: string, langCode: string) => void;
}

export default function CallInterface({ 
  partner, 
  partnerDialect, 
  noiseLevel,
  onAddHistory,
  onSynthesizeSpeech
}: CallInterfaceProps) {
  const [callStatus, setCallStatus] = useState<"idle" | "ringing" | "connected" | "ended">("idle");
  const [isIncoming, setIsIncoming] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [transcripts, setTranscripts] = useState<CallTranscriptItem[]>([]);
  
  // Controls for Text manual override (highly useful for sandbox testing!)
  const [textOverrideInput, setTextOverrideInput] = useState<string>("");
  const [userSelectedDialect, setUserSelectedDialect] = useState<string>("en-US-Southern");

  // Speech Recognition state
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(false);
  const [isListeningSpeech, setIsListeningSpeech] = useState<boolean>(false);
  
  // Sound wave levels (simulated and dynamic)
  const [userAudioLevel, setUserAudioLevel] = useState<number>(0);
  const [partnerAudioLevel, setPartnerAudioLevel] = useState<number>(0);
  
  // Loading statuses
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isPartnerResponding, setIsPartnerResponding] = useState<boolean>(false);

  // References
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check browser SpeechRecognition support
  useEffect(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      setIsSpeechSupported(true);
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = false;
      
      // Select appropriate mic language based on chosen source dialect
      rec.lang = userSelectedDialect.startsWith("es") ? "es-MX" : 
                 userSelectedDialect.startsWith("hi") ? "hi-IN" : "en-US";

      rec.onstart = () => {
        setIsListeningSpeech(true);
        simulateWaveform("user");
      };

      rec.onresult = async (event: any) => {
        const resultText = event.results[0][0].transcript;
        if (resultText) {
          handleUserSpeech(resultText);
        }
      };

      rec.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        setIsListeningSpeech(false);
      };

      rec.onend = () => {
        setIsListeningSpeech(false);
      };

      recognitionRef.current = rec;
    }
  }, [userSelectedDialect]);

  // Adjust timers for duration
  useEffect(() => {
    if (callStatus === "connected") {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus]);

  // Auto scroll to latest speech bubbles
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts, isTranslating, isPartnerResponding]);

  // Handle cleanup of audio level intervals
  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, []);

  // Format Duration string
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? hrs + ":" : ""}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Simulate audio amplitudes visually
  const simulateWaveform = (target: "user" | "partner") => {
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    
    let count = 0;
    audioIntervalRef.current = setInterval(() => {
      count++;
      const randomAmp = Math.floor(Math.random() * 80) + 10;
      if (target === "user") {
        setUserAudioLevel(randomAmp);
        setPartnerAudioLevel(0);
      } else {
        setPartnerAudioLevel(randomAmp);
        setUserAudioLevel(0);
      }

      if (count > 25) {
        if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
        setUserAudioLevel(0);
        setPartnerAudioLevel(0);
      }
    }, 150);
  };

  // Initiate manual trigger on voice or button click
  const toggleSpeechListen = () => {
    if (!isSpeechSupported) return;
    
    if (isListeningSpeech) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.warn("Speech session failed to cold boot. Using fallback text box model.");
      }
    }
  };

  // Call Outgoing simulation
  const startCall = () => {
    setTranscripts([]);
    setDuration(0);
    setCallStatus("ringing");
    setIsIncoming(false);

    // Dynamic ring sounds simulated
    onSynthesizeSpeech(`Calling ${partner.name}. Please wait for regional bridge connection.`, "en-US");

    setTimeout(() => {
      setCallStatus("connected");
      // Partner gives greeting
      const initialGreetingSnippet: CallTranscriptItem = {
        id: "greet-" + Date.now(),
        speaker: "partner",
        originalText: partner.greeting,
        translatedText: "Hello my friend! Is everything fine with you?",
        pinyinOrPhonetic: partnerDialect.code === "hi-Bhojpuri" ? "Pranam bhaiya! Raua sab khairiyat ba?" : "Greeting translation preview",
        culturalNote: "Traditional regional greetings often check on overall communal welfare.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setTranscripts([initialGreetingSnippet]);
      
      // Synthesize partner greeting
      onSynthesizeSpeech(partner.greeting, partnerDialect.voiceId || "en-US");
      simulateWaveform("partner");
    }, 2500);
  };

  // Pre-configured simulation for incoming calls to make the application highly interactive
  const initiateIncomingCall = () => {
    setTranscripts([]);
    setDuration(0);
    setCallStatus("ringing");
    setIsIncoming(true);
    onSynthesizeSpeech(`Incoming voice call translation from ${partner.name}.`, "en-US");
  };

  const acceptIncomingCall = () => {
    setCallStatus("connected");
    setIsIncoming(false);
    
    const initialGreetingSnippet: CallTranscriptItem = {
      id: "greet-" + Date.now(),
      speaker: "partner",
      originalText: partner.greeting,
      translatedText: "Hello my friend! Is everything fine with you?",
      pinyinOrPhonetic: "Local voice transcription matching",
      culturalNote: "A local friendly dialect phrase requesting to bridge dialogue.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    
    setTranscripts([initialGreetingSnippet]);
    onSynthesizeSpeech(partner.greeting, partnerDialect.voiceId || "en-US");
    simulateWaveform("partner");
  };

  const hangUpCall = () => {
    onAddHistory(partner.name, transcripts, duration);
    setCallStatus("ended");
    onSynthesizeSpeech("Call translate connection ended.", "en-US");
    setTimeout(() => {
      setCallStatus("idle");
    }, 1500);
  };

  // CORE ENGINE PIPELINE: User Speaks/Clicks Text => Translate Endpoint => Response Pipeline
  const handleUserSpeech = async (spokenText: string) => {
    if (!spokenText.trim()) return;
    setIsTranslating(true);
    simulateWaveform("user");

    const tempUserSnippetId = "user-temp-" + Date.now();
    
    try {
      // 1. Send input user speech to backend translation node
      const translateResponse = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: spokenText,
          sourceDialect: userSelectedDialect,
          targetDialect: partnerDialect.code
        })
      });

      const transData: DialectAnalysis = await translateResponse.json();

      if (!translateResponse.ok) {
        throw new Error("Trans response broken");
      }

      // Add user transcript block
      const userItem: CallTranscriptItem = {
        id: "user-" + Date.now(),
        speaker: "user",
        originalText: spokenText,
        translatedText: transData.translatedText,
        pinyinOrPhonetic: transData.phoneticGuide,
        culturalNote: transData.culturalNote,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setTranscripts((prev) => [...prev, userItem]);
      setIsTranslating(false);

      // SynthesizeTranslated Voice representation for simulated receiver
      onSynthesizeSpeech(transData.translatedText, partnerDialect.voiceId || "en-US");

      // 2. Fetch Automated AI Companion response based on their background and conversation
      setIsPartnerResponding(true);
      const hostHistory = transcripts.map((t) => ({
        speaker: t.speaker,
        text: t.translatedText
      }));

      const partnerResponse = await fetch("/api/partner-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerId: partner.id,
          conversationHistory: hostHistory,
          latestUserMsg: transData.translatedText,
          partnerDialect: partnerDialect.code,
          userDialect: userSelectedDialect
        })
      });

      const partnerData = await partnerResponse.json();
      
      if (!partnerResponse.ok) {
        throw new Error("Partner response fail");
      }

      setIsPartnerResponding(false);

      const partnerItem: CallTranscriptItem = {
        id: "partner-" + Date.now(),
        speaker: "partner",
        originalText: partnerData.partnerReplyOriginal,
        translatedText: partnerData.partnerReplyTranslated,
        pinyinOrPhonetic: partnerData.replyPhonetics,
        culturalNote: partnerData.culturalTouchpoint,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setTranscripts((prev) => [...prev, partnerItem]);
      
      // Play synthesis of the partner spoken reply back to the user
      onSynthesizeSpeech(partnerData.partnerReplyOriginal, partnerDialect.voiceId || "en-US");
      simulateWaveform("partner");

    } catch (err) {
      console.error("Call interface pipeline broke:", err);
      setIsTranslating(false);
      setIsPartnerResponding(false);

      // Add fallback simulated snippet so user doesn't hit a wall
      const fallbackItem: CallTranscriptItem = {
        id: "err-" + Date.now(),
        speaker: "partner",
        originalText: "भैया, नेटवर्क तनी कमज़ोर बुझात बा। फिर से कही? (Brother, signal seems weak. Speak again?)",
        translatedText: "The network signal seems slightly weak. Could you repeat that?",
        pinyinOrPhonetic: "Bhaiya, network tani kamzor bujhat ba.",
        culturalNote: "Adapts to local network anomalies gracefully in Bhojpuri.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setTranscripts((prev) => [...prev, fallbackItem]);
    }
  };

  const handleManualSend = () => {
    if (!textOverrideInput.trim()) return;
    const cache = textOverrideInput;
    setTextOverrideInput("");
    handleUserSpeech(cache);
  };

  // Preset phrases to help user test the translation flow immediately
  const handleInsertPreset = (preset: string) => {
    setTextOverrideInput(preset);
  };

  const downloadCallTranscript = () => {
    const rawLines = transcripts.map((t) => {
      const spk = t.speaker === "user" ? "You (User)" : `${partner.name} (AI Partner)`;
      return `[${t.timestamp}] ${spk}:\nOriginal: ${t.originalText}\nTranslated: ${t.translatedText}\nPhonetic hint: ${t.pinyinOrPhonetic || 'N/A'}\nCultural context: ${t.culturalNote || 'N/A'}\n---------------------------------------------`;
    }).join("\n\n");

    const blob = new Blob([`VE LOCE REAL-TIME PHONE CALL VOICE TRANSLATION REPORT\nActive Partner: ${partner.name} (${partnerDialect.name})\nSimulated Noise: ${noiseLevel}\nCall Duration: ${formatTime(duration)}\n\n` + rawLines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Veloce_Transcript_${partner.name.replace(" ", "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
      {/* PHONE VIEW - LEFT (xl:5-span) */}
      <div className="xl:col-span-5 flex flex-col justify-between bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden min-h-[620px]">
        {/* Ambient grid glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.06),transparent_50%)] pointer-events-none" />

        {/* Status/Call-bar Header */}
        <div className="flex justify-between items-center bg-black/30 border border-white/5 p-3 rounded-2xl relative z-10 font-sans">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-teal-400 animate-pulse" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">SIP Voice Bridge</span>
          </div>
          {callStatus === "connected" && (
            <div className="flex items-center gap-2 text-rose-400 font-mono text-xs bg-rose-500/10 px-2.5 py-0.5 rounded-full animate-pulse border border-rose-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              TEMPO: {formatTime(duration)}
            </div>
          )}
          {callStatus === "ringing" && (
            <span className="text-xs font-mono font-bold text-amber-400 animate-pulse bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Ringing Link...
            </span>
          )}
          {callStatus === "idle" && (
            <span className="text-xs font-mono text-slate-500 bg-black/30 px-2 py-0.5 rounded border border-white/5">
              STANDBY
            </span>
          )}
        </div>

        {/* CALL STATUS VIEWS */}
        {callStatus === "idle" && (
          <div className="my-auto py-12 text-center space-y-6 relative z-10 animate-fadeIn">
            <div className="relative mx-auto w-36 h-36 flex items-center justify-center">
              <div className="absolute inset-0 bg-teal-500/10 rounded-full blur-2xl animate-pulse pointer-events-none"></div>
              <div className="relative w-32 h-32 rounded-full border-2 border-teal-500/20 p-1 bg-black/20 backdrop-blur-md flex items-center justify-center">
                <img 
                  src={partner.avatar} 
                  alt={partner.name} 
                  className="w-full h-full rounded-full object-cover border border-white/10 z-10 shadow-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div className="space-y-2 max-w-sm mx-auto">
              <h3 className="text-xl font-bold text-slate-100">{partner.name}</h3>
              <p className="text-teal-400 text-xs font-mono bg-teal-500/5 border border-teal-500/20 px-2.5 py-1 rounded inline-block uppercase tracking-wider font-semibold">
                Target: {partnerDialect.name}
              </p>
              <p className="text-slate-400 text-xs italic px-6 mt-2 leading-relaxed">
                "{partner.backstory}"
              </p>
            </div>

            {/* Quick Action triggers */}
            <div className="flex justify-center gap-3 pt-4">
              <button
                id="btn-call-connect"
                onClick={startCall}
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-teal-500/20 text-xs flex items-center gap-2 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" /> Simulate Dial Call
              </button>
              <button
                id="btn-incoming-simulate"
                onClick={initiateIncomingCall}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-teal-400 font-semibold px-4 py-3 rounded-2xl transition-all text-xs cursor-pointer"
              >
                Inbound call trigger
              </button>
            </div>
          </div>
        )}

        {callStatus === "ringing" && (
          <div className="my-auto py-12 text-center space-y-8 relative z-10 animate-pulse">
            <div className="relative mx-auto w-36 h-36 flex items-center justify-center">
              <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="relative w-32 h-32 rounded-full border-2 border-teal-500/40 p-1 bg-black/20 backdrop-blur-md flex items-center justify-center">
                <img 
                  src={partner.avatar} 
                  alt={partner.name} 
                  className="w-full h-full rounded-full object-cover border border-white/10 z-10"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -inset-2 border border-teal-500/25 rounded-full animate-ping duration-1500"></div>
                <div className="absolute -inset-4 border border-teal-500/10 rounded-full"></div>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 text-xs uppercase tracking-widest font-mono font-bold">
                {isIncoming ? "INCOMING ENCRYPTED VOIP CALL" : "DIALING TRANSLATION PROXIES"}
              </p>
              <h3 className="text-2xl font-extrabold text-slate-100">{partner.name}</h3>
              <p className="text-xs text-indigo-400 font-mono mt-1 font-semibold">
                {isIncoming ? "Speech recognition bridge requested..." : "Adapting voice wave filters..."}
              </p>
            </div>

            {isIncoming ? (
              <div className="flex justify-center gap-4 pt-4">
                <button
                  id="btn-decline"
                  onClick={() => setCallStatus("idle")}
                  className="bg-rose-500/20 hover:bg-rose-500 border border-rose-500/30 hover:text-white text-rose-300 font-bold px-6 py-3 rounded-xl transition-all text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <PhoneOff className="w-4 h-4" /> Decline
                </button>
                <button
                  id="btn-accept"
                  onClick={acceptIncomingCall}
                  className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-8 py-3 rounded-xl transition-all text-xs flex items-center gap-1.5 shadow-lg shadow-teal-500/20 cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" /> Accept Call
                </button>
              </div>
            ) : (
              <button
                id="btn-cancel-call"
                onClick={() => setCallStatus("idle")}
                className="mx-auto bg-rose-500/20 border border-rose-500/30 text-rose-300 font-semibold px-6 py-2 rounded-xl transition-all text-xs flex items-center gap-1.5 cursor-pointer"
              >
                Cancel call
              </button>
            )}
          </div>
        )}

        {callStatus === "connected" && (
          <div className="my-auto py-4 flex flex-col items-center justify-between space-y-6 relative z-10 animate-fadeIn w-full">
            <div className="flex items-center gap-4 bg-black/25 backdrop-blur-md border border-white/5 p-4 rounded-3xl w-full">
              <div className="relative w-14 h-14 rounded-full border-2 border-teal-500/30 p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(45,212,191,0.2)]">
                <img 
                  src={partner.avatar} 
                  alt={partner.name} 
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-left flex-1">
                <h4 className="text-slate-100 font-bold text-sm tracking-tight">{partner.name}</h4>
                <div className="flex gap-1.5 mt-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse shadow-[0_0_8px_rgba(45,212,191,0.6)]"></span>
                  <p className="text-teal-400 text-[10px] uppercase font-mono tracking-wider font-bold leading-none">CONNECTED • VoIP</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] uppercase bg-indigo-500/20 font-semibold text-indigo-300 px-2.5 py-0.5 rounded font-mono">
                  {partnerDialect.nativeName}
                </span>
                <span className="text-[9px] font-mono text-slate-500">Noise: {noiseLevel}</span>
              </div>
            </div>

            {/* TWIN WAVE AUDIO METERS */}
            <div className="grid grid-cols-2 gap-4 w-full">
              {/* User amplitude */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2.5">
                <span className="text-[10px] uppercase tracking-widest font-mono text-slate-400">Local Mic Input (You)</span>
                <div className="h-10 flex items-end justify-center gap-1.5 w-full max-w-[80px]">
                  {[1, 2, 3, 4, 5].map((idx) => {
                    const currentHeight = userAudioLevel ? Math.max(12, userAudioLevel * (0.2 + idx * 0.15)) : 12;
                    return (
                      <span 
                        key={idx} 
                        style={{ height: `${currentHeight}%` }} 
                        className="w-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.4)] transition-all duration-150 inline-block"
                      ></span>
                    );
                  })}
                </div>
                <span className="text-[9px] font-mono text-teal-400 font-semibold uppercase tracking-wider">
                  {isListeningSpeech ? "Speech Active" : "Waiting..."}
                </span>
              </div>

              {/* Partner amplitude */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2.5">
                <span className="text-[10px] uppercase tracking-widest font-mono text-slate-400 font-medium">AI Receiver Output</span>
                <div className="h-10 flex items-end justify-center gap-1.5 w-full max-w-[80px]">
                  {[1, 2, 3, 4, 5].map((idx) => {
                    const currentHeight = partnerAudioLevel ? Math.max(12, partnerAudioLevel * (0.2 + idx * 0.15)) : 12;
                    return (
                      <span 
                        key={idx} 
                        style={{ height: `${currentHeight}%` }} 
                        className="w-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.4)] transition-all duration-150 inline-block"
                      ></span>
                    );
                  })}
                </div>
                <span className="text-[9px] font-mono text-indigo-400 font-semibold uppercase tracking-wider">
                  {isPartnerResponding ? "Synthesizing" : "Standby"}
                </span>
              </div>
            </div>

            {/* CONTROLLERS GRID */}
            <div className="bg-black/20 border border-white/5 rounded-2.5xl p-4 w-full space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
                <span>Configure Input Dialect Context:</span>
                <select
                  value={userSelectedDialect}
                  onChange={(e) => setUserSelectedDialect(e.target.value)}
                  className="bg-black border border-white/10 text-teal-400 font-semibold px-2.5 py-1.5 rounded-lg text-xs"
                >
                  <option value="en-US-Southern">English (US Southern)</option>
                  <option value="es-MX-Northern">Spanish (Mexican Norteño)</option>
                  <option value="hi-Bhojpuri">Hindi (Bhojpuri Dialect)</option>
                </select>
              </div>

              {/* MIC TRIGGERS & INPUT CHANNELS */}
              <div className="flex items-center gap-2">
                {isSpeechSupported ? (
                  <button
                    id="mic-record-speech"
                    onClick={toggleSpeechListen}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold select-none flex-1 transition-all pointer-events-auto cursor-pointer ${
                      isListeningSpeech 
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse"
                        : "bg-teal-500 text-slate-950 hover:bg-teal-400"
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    {isListeningSpeech ? "Listening Spoken Voice..." : "Speak to Live Mic"}
                  </button>
                ) : (
                  <div className="bg-black/40 border border-white/5 py-2.5 px-4 rounded-xl text-[10px] text-slate-500 flex-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-slate-600" /> Microphone simulation via panel text field below
                  </div>
                )}
                <button
                  id="mute-user-call"
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                    isMuted 
                      ? "bg-rose-500/20 text-rose-400 border-rose-500/30" 
                      : "bg-black/40 text-[#adb5bd] border-white/5 hover:text-white"
                  }`}
                  title={isMuted ? "Unmute Mic" : "Mute Mic"}
                >
                  {isMuted ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
                </button>
              </div>

              {/* MANUAL SENTENCE TRIGGER MODEL */}
              <div className="border-t border-white/5 pt-3 flex gap-1.5">
                <input
                  id="call-manual-input"
                  type="text"
                  placeholder="Type/Send manual voice translation simulation..."
                  value={textOverrideInput}
                  onChange={(e) => setTextOverrideInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleManualSend()}
                  className="bg-black/40 border border-white/10 placeholder-slate-600 text-slate-200 text-xs px-3 py-2 rounded-lg flex-1 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <button
                  id="manual-send-btn"
                  onClick={handleManualSend}
                  disabled={isTranslating || !textOverrideInput.trim()}
                  className="bg-teal-500/10 border border-teal-500/30 hover:bg-teal-500/20 text-teal-400 font-bold px-3 py-2 rounded-lg text-xs cursor-pointer disabled:opacity-40"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HANG UP CALL MODULE */}
        <div className="mt-4 relative z-10">
          {callStatus !== "idle" ? (
            <button
              id="hangup-call-btn"
              onClick={hangUpCall}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-rose-500/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <PhoneOff className="w-5 h-5 pointer-events-none" /> End Connection
            </button>
          ) : (
            <p className="text-[10px] text-center text-slate-500 font-mono tracking-wider uppercase">
              Veloce VoIP Client • End-to-End Encryption
            </p>
          )}
        </div>
      </div>

      {/* DUAL SPEECH TERMINALS - RIGHT (xl:7-span) */}
      <div className="xl:col-span-7 flex flex-col justify-between bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 min-h-[620px] max-h-[750px] relative overflow-hidden">
        {/* Ambient grid glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.04),transparent_50%)] pointer-events-none" />

        <div className="flex items-center justify-between border-b border-white/5 pb-3 flex-shrink-0 relative z-10">
          <div className="flex items-center gap-2">
            <MessageSquareCode className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-slate-100 text-base">Real-Time Translated Transcript</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="exprt-btn"
              disabled={transcripts.length === 0}
              onClick={downloadCallTranscript}
              className="text-slate-200 hover:text-white border border-white/10 disabled:opacity-40 disabled:hover:text-slate-400 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1 font-medium cursor-pointer font-mono"
            >
              <Download className="w-3.5 h-3.5" /> Export Transcripts
            </button>
          </div>
        </div>

        {/* DIALOG TERMINAL BOX */}
        <div className="flex-1 my-4 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-white/10 max-h-[440px] relative z-10">
          {transcripts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 text-slate-500">
              <span className="w-12 h-12 bg-white/5 text-teal-400 rounded-full flex items-center justify-center border border-white/10 shadow-[0_0_12px_rgba(45,212,191,0.15)]">
                <Languages className="w-6 h-6" />
              </span>
              <div className="max-w-xs space-y-1">
                <p className="text-sm font-semibold text-slate-300">Bridge Standby Ready</p>
                <p className="text-xs leading-relaxed text-slate-500">
                  Connect a simulated live call and begin speaking or typing to generate full-fidelity dialogue adaptabilities.
                </p>
              </div>

              {/* QUICK STARTER PHRASES FOR USER TO QUICKLY PLAY WITH APPS */}
              <div className="pt-2 text-left w-full max-w-sm space-y-2">
                <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Fast Test Phrases (Click to stage)</span>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => handleInsertPreset("Hello! How is the organic wheat crop growing this harvest?")}
                    className="text-slate-300 hover:text-teal-300 hover:bg-white/5 p-2 bg-black/20 border border-white/5 rounded-xl text-xs text-left transition-colors font-medium flex justify-between items-center cursor-pointer"
                  >
                    <span>Organic wheat crop status</span>
                    <Play className="w-3 h-3 text-slate-500" />
                  </button>
                  <button
                    onClick={() => handleInsertPreset("Can we arrange some Sonoran steaks for the ranch party tonight?")}
                    className="text-slate-300 hover:text-teal-300 hover:bg-white/5 p-2 bg-black/20 border border-white/5 rounded-xl text-xs text-left transition-colors font-medium flex justify-between items-center cursor-pointer"
                  >
                    <span>Ranch steak arrangements</span>
                    <Play className="w-3 h-3 text-slate-500" />
                  </button>
                  <button
                    onClick={() => handleInsertPreset("I would love to learn more about old tango dancing records, my friend.")}
                    className="text-slate-300 hover:text-teal-300 hover:bg-white/5 p-2 bg-black/20 border border-white/5 rounded-xl text-xs text-left transition-colors font-medium flex justify-between items-center cursor-pointer"
                  >
                    <span>Tango & vinyl tea chat</span>
                    <Play className="w-3 h-3 text-slate-500" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {transcripts.map((t) => {
                const isUser = t.speaker === "user";
                return (
                  <div 
                    id={`transcript-msg-${t.id}`}
                    key={t.id} 
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1`}
                  >
                    <div className="max-w-[85%] space-y-1">
                      {/* Original spoken / source context */}
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase px-1 font-mono">
                        <span>{isUser ? "You Spoke" : partner.name}</span>
                        <span>•</span>
                        <span>{t.timestamp}</span>
                      </div>

                      {/* Speaking core elements */}
                      <div className={`p-4 rounded-2xl relative ${
                        isUser 
                          ? "bg-teal-500/10 border border-teal-500/20 text-slate-100" 
                          : "bg-white/5 border border-white/5 text-slate-100"
                      }`}>
                        
                        {/* Spoken original */}
                        <div className="text-xs text-slate-400 italic">"{t.originalText}"</div>

                        {/* LIVE translated result */}
                        <div className="mt-2 text-sm font-semibold flex items-start gap-2 text-teal-100">
                          <ChevronRight className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span>{t.translatedText}</span>
                            <button
                              id={`listen-conv-btn-${t.id}`}
                              onClick={() => onSynthesizeSpeech(t.translatedText, isUser ? partnerDialect.voiceId || "en-US" : "en-US")}
                              className="inline-flex ml-2 text-slate-400 hover:text-teal-300 transition-colors p-1 cursor-pointer"
                              title="Speak out loud"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Phonetics helper info */}
                        {t.pinyinOrPhonetic && (
                          <div className="mt-2 text-[11px] font-mono text-indigo-300 bg-indigo-500/10 py-1 px-2.5 rounded-lg border border-indigo-500/25">
                            📢 Pronunciation: <span className="font-sans italic">{t.pinyinOrPhonetic}</span>
                          </div>
                        )}
                      </div>

                      {/* Linguistic / cultural adaptation footnote */}
                      {t.culturalNote && (
                        <div className="bg-black/30 text-slate-300 rounded-xl px-3 py-2 text-[11px] border border-white/5 leading-relaxed flex gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-slate-300">Dialect Footnote: </span>
                            {t.culturalNote}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Dynamic translator engine visualizers */}
              {isTranslating && (
                <div className="flex justify-end gap-1.5 items-center text-xs text-teal-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce delay-200" />
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce delay-300" />
                  <span className="font-mono text-[10px]">Gemini Translating & Localizing Dialect...</span>
                </div>
              )}

              {isPartnerResponding && (
                <div className="flex gap-1.5 items-center text-xs text-indigo-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce delay-200" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce delay-300" />
                  <span className="font-mono text-[10px]">{partner.name} formulating regional response...</span>
                </div>
              )}

              <div ref={transcriptEndRef} />
            </div>
          )}
        </div>

        {/* FOOTER METRIC NOTE - flex-shrink-0 */}
        <div className="bg-black/20 border border-white/5 p-4 rounded-2xl flex-shrink-0 relative z-10">
          <h4 className="text-[10px] uppercase font-mono text-teal-400 tracking-wider font-semibold mb-2">Live Dialect Localizers Attached</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            The translation model utilizes advanced semantic word replacements to match cultural connotations. Localized values adapt automatically to rural dialects. Try toggling <strong>Noise levels</strong> in top header to simulate ambient filtering.
          </p>
        </div>
      </div>
    </div>
  );
}
