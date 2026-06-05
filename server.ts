import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialization utility for GoogleGenAI
let aiInstance: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please set it in user secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// CURATED DIALERTS LIST FOR QUICK METADATA API
const SUPPORTED_DIALECTS = {
  "en-US-Southern": {
    code: "en-US-Southern",
    name: "US Southern",
    nativeName: "Southern Drawl",
    region: "Southern United States",
    description: "Characterized by warm drawls, friendly greetings ('y'all'), and heavy use of traditional idioms.",
    slangExamples: [
      { phrase: "Bless your heart", meaning: "Expression of sympathy, concern, or subtle pity.", usage: "Oh honey, you didn't know? Bless your heart." },
      { phrase: "Fixin' to", meaning: "Getting ready to do something.", usage: "I'm fixin' to cook up some sweet tea." }
    ],
    voiceId: "en-US",
    accentPrefix: "southern"
  },
  "es-MX-Northern": {
    code: "es-MX-Northern",
    name: "Mexican (Norteño)",
    nativeName: "Español Norteño",
    region: "Northern Mexico",
    description: "Direct tone with high speech-rates, common use of 'morro', 'bato', and rustic phrases influenced by border proximity.",
    slangExamples: [
      { phrase: "¿Qué onda, plebe?", meaning: "What's up, kid/buddy?", usage: "¿Qué onda, plebe? ¿Cómo va todo por el rancho?" },
      { phrase: "Arre", meaning: "Let's do it / Okay (agreement).", usage: "¿Vamos por unos tacos? ¡Arre!" }
    ],
    voiceId: "es-MX",
    accentPrefix: "norteño"
  },
  "hi-Bhojpuri": {
    code: "hi-Bhojpuri",
    name: "Hindi (Bhojpuri Dialect)",
    nativeName: "भोजपुरी",
    region: "Eastern Uttar Pradesh & Bihar, India",
    description: "Highly musical, respectful yet earthy dialect of Northern/Eastern India, often using polite plural pronouns.",
    slangExamples: [
      { phrase: "का हाल बा? (Kaa haal ba?)", meaning: "How are you?", usage: "अरे भैया, का हाल बा? सब ठीक-ठाक?" },
      { phrase: "गजब (Gajab)", meaning: "Awesome / Amazing.", usage: "रउआ त गजब काम कइनी!" }
    ],
    voiceId: "hi-IN",
    accentPrefix: "bhojpuri"
  },
  "ja-Kansai": {
    code: "ja-Kansai",
    name: "Japanese (Kansai-ben)",
    nativeName: "関西弁",
    region: "Osaka, Kyoto & Kobe, Japan",
    description: "Famous upbeat, witty, and friendly dialect of Japan's southern-central region. Known for humor and expressive particle changes.",
    slangExamples: [
      { phrase: "なんでやねん (Nandeyanen)", meaning: "You've got to be kidding / Why is that?!", usage: "A comic reaction to something unexpected: Nandeyanen!" },
      { phrase: "おおきに (Ookini)", meaning: "Thank you.", usage: "Ookini! Always used by shopkeepers in Kyoto/Osaka." }
    ],
    voiceId: "ja-JP",
    accentPrefix: "kansai"
  },
  "es-AR-Rioplatense": {
    code: "es-AR-Rioplatense",
    name: "Argentinian (Rioplatense)",
    nativeName: "Castellano Rioplatense",
    region: "River Plate Region (Buenos Aires/Uruguay)",
    description: "Famous for 'voseo' (using 'vos' instead of 'tú'), Italian-inspired intonation, and extensive Lunfardo slang.",
    slangExamples: [
      { phrase: "Che, ¿cómo andás?", meaning: "Hey, how are you doing?", usage: "Che! ¿Cómo andás, todo bien?" },
      { phrase: "Posta", meaning: "Really? / Truth.", usage: "Me compraron el auto. ¡Posta!" }
    ],
    voiceId: "es-AR",
    accentPrefix: "rioplatense"
  },
  "en-GB-Cockney": {
    code: "en-GB-Cockney",
    name: "East London (Cockney)",
    nativeName: "Cockney Rhyming",
    region: "East End, London (UK)",
    description: "Rich working-class history with rhyming slang, glottal stops, and expressive local storytelling terms.",
    slangExamples: [
      { phrase: "Apples and pears", meaning: "Stairs.", usage: "I'm heading up the apples and pears to bed." },
      { phrase: "Dog and bone", meaning: "Phone.", usage: "Get on the dog and bone, we need to call 'em!" }
    ],
    voiceId: "en-GB",
    accentPrefix: "cockney"
  },
  "zh-HK-Cantonese": {
    code: "zh-HK-Cantonese",
    name: "Cantonese (Hong Kong)",
    nativeName: "廣東話",
    region: "Hong Kong & Guangdong",
    description: "Expressive dialect with nine vocal tones, rich linguistic history, and localized English-hybrid slang.",
    slangExamples: [
      { phrase: "食咗飯未呀？ (Sik dzo fan mei a?)", meaning: "Have you eaten yet? (Common greeting)", usage: "Hey friend, sik dzo fan mei a?" },
      { phrase: "頂呱呱 (Ding gwa gwa)", meaning: "Topnotch / Superb.", usage: "This food tastes ding gwa gwa!" }
    ],
    voiceId: "zh-HK",
    accentPrefix: "cantonese"
  },
  "fr-CA-Quebecois": {
    code: "fr-CA-Quebecois",
    name: "Canadian French (Québécois)",
    nativeName: "Québécois",
    region: "Quebec, Canada",
    description: "Distinctive vowel sounds, unique idioms, and archaic maritime phrases evolved from 17th-century French.",
    slangExamples: [
      { phrase: "Magasiner", meaning: "To go shopping", usage: "On s'en va magasiner cet après-midi." },
      { phrase: "Tant qu'à faire", meaning: "Might as well", usage: "Tant qu'à faire, on mangera poutine!" }
    ],
    voiceId: "fr-CA",
    accentPrefix: "quebecois"
  }
};

// 1. Get List of Supported Dialects &curated details
app.get("/api/dialects", (req, res) => {
  res.json({ dialects: SUPPORTED_DIALECTS });
});

// 2. Main Regional Voice Call Translation Engine
app.post("/api/translate", async (req, res) => {
  try {
    const { text, sourceDialect, targetDialect } = req.body;

    if (!text || !sourceDialect || !targetDialect) {
      return res.status(400).json({ error: "Missing required fields: text, sourceDialect, targetDialect" });
    }

    const ai = getGemini();

    const prompt = `
      You are a world-class translation interpreter specializing in ultra-accurate regional dialect adaptation.
      Your goal is to translate a live spoken statement between two callers from different cultures.
      
      Translation Tasks:
      - Source Language/Dialect: ${sourceDialect}
      - Target Language/Dialect: ${targetDialect}
      - Text to Translate: "${text}"

      Guidelines:
      1. Do not translate literally if it fails to capture the local spirit. Perform a colloquial localization!
      2. If target is Mexican Norteño, use North-Mexico slang (arre, compa, bato, etc.).
      3. If target is Bhojpuri, adapt to rural Eastern UP/Bihar phrasing (रउआ, का हाल बा, गजब, etc.).
      4. If target is Southern Drawl, make it extremely polite and friendly with classic Southern expressions.
      5. Extract or formulate phonetic guide (like custom phonetic spelling) so the caller knows how it should sound logically.
      6. Provide a fascinating "culturalNote" explaining the subtle idiom shifts, why you chose specific words, and how it fits the dialect. Make it warm and interesting!
      7. Provide 2-3 shorter alternate variations of Saying this in the target dialect.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional voice call translation assistant. You output highly accurate, localized, warm, and culturally adapted colloquial translation mappings in JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translatedText: { 
              type: Type.STRING, 
              description: "The primary localized translation in the target dialect."
            },
            phoneticGuide: { 
              type: Type.STRING, 
              description: "A readable pronunciation spelling or guide for the speaker." 
            },
            culturalNote: { 
              type: Type.STRING, 
              description: "A brief cultural and linguistic explanation of the translation choice (under 25 words)." 
            },
            colloquialAlternates: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Alternative ways to say this phrase in the target dialect."
            },
            toneExplanation: { 
              type: Type.STRING, 
              description: "Guidance on the emotional delivery (e.g., respectful, enthusiastic, neutral)." 
            }
          },
          required: ["translatedText", "phoneticGuide", "culturalNote", "colloquialAlternates"]
        }
      }
    });

    const bodyText = response.text;
    if (!bodyText) {
      throw new Error("No response text yielded from Gemini.");
    }

    const result = JSON.parse(bodyText.trim());
    res.json(result);

  } catch (error: any) {
    console.error("Translation Endpoint Error:", error);
    res.status(500).json({ 
      error: "Error processing translation", 
      details: error.message || error 
    });
  }
});

// 3. AI Partner response generator
app.post("/api/partner-response", async (req, res) => {
  try {
    const { partnerId, conversationHistory, latestUserMsg, partnerDialect, userDialect } = req.body;

    if (!partnerId || !latestUserMsg) {
      return res.status(400).json({ error: "Missing required arguments: partnerId, latestUserMsg" });
    }

    const ai = getGemini();

    const prompt = `
      You are taking part in a simulated real-time phone call. You must speak in character.
      
      Partner Context:
      - Partner ID: ${partnerId}
      - Your Dialect: ${partnerDialect} (Keep all your native phrases extremely true to this dialect)
      - User's Dialect: ${userDialect}
      
      The user just said: "${latestUserMsg}" (this is the translation of what they spoke).
      
      History of Call:
      ${JSON.stringify(conversationHistory || [])}

      Objectives:
      1. Formulate a short, warm, and engaging conversational response (1-2 sentences) in your authentic native dialect.
      2. Provide your direct spoken text.
      3. Translate it back to the User's dialect (${userDialect}) so the real-time call translation machine can speak it on the user's end.
      4. Add an interesting dialect remark or accent delivery instruction.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are playing a role in a voice call translation simulation. Respond as a helpful native speaker using local colloquialisms. Output the response in JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            partnerReplyOriginal: { 
              type: Type.STRING, 
              description: "The response spoken by the AI partner in their native dialect." 
            },
            partnerReplyTranslated: { 
              type: Type.STRING, 
              description: "The translated version of the reply, adapted to the User's dialect." 
            },
            replyPhonetics: {
              type: Type.STRING,
              description: "How to pronounce the partner's native reply."
            },
            culturalTouchpoint: {
              type: Type.STRING,
              description: "A simple educational note about this regional response (under 20 words)."
            }
          },
          required: ["partnerReplyOriginal", "partnerReplyTranslated", "replyPhonetics", "culturalTouchpoint"]
        }
      }
    });

    const bodyText = response.text;
    if (!bodyText) {
      throw new Error("No response text yielded from Gemini.");
    }

    const result = JSON.parse(bodyText.trim());
    res.json(result);

  } catch (error: any) {
    console.error("Partner Response Endpoint Error:", error);
    res.status(500).json({ 
      error: "Error generating partner response", 
      details: error.message || error 
    });
  }
});

// Setup development server or production server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
