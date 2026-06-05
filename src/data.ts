import { CallPartner, Dialect } from "./types";

export const SEED_DIALECTS: Record<string, Dialect> = {
  "en-US-Southern": {
    code: "en-US-Southern",
    name: "US Southern",
    nativeName: "Southern Drawl",
    region: "Southern United States",
    description: "Characterized by warm drawls, friendly greetings ('y'all'), and heavy use of traditional idioms.",
    slangExamples: [
      { phrase: "Bless your heart", meaning: "Expression of sympathy, concern, or subtle pity.", usage: "Oh honey, you didn't know? Bless your heart." },
      { phrase: "Fixin' to", meaning: "Getting ready to do something.", usage: "I'm fixin' to cook up some sweet tea." },
      { phrase: "Madder than a wet hen", meaning: "To be extremely angry.", usage: "Boss made her work late, she is madder than a wet hen." }
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
      { phrase: "Arre", meaning: "Let's do it / Okay (agreement).", usage: "¿Vamos por unos tacos? ¡Arre!" },
      { phrase: "Bato", meaning: "Guy / Dude.", usage: "Ese bato es muy buena onda." }
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
      { phrase: "गजब (Gajab)", meaning: "Awesome / Amazing.", usage: "रउआ त गजब काम कइनी!" },
      { phrase: "रउआ (Raua)", meaning: "You (highly respectful form).", usage: "रउआ कब आईल बानी?" }
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
      { phrase: "おおきに (Ookini)", meaning: "Thank you.", usage: "Ookini! Always used by shopkeepers in Kyoto/Osaka." },
      { phrase: "めっちゃ (Metcha)", meaning: "Very / Extremely.", usage: "Kono ramen, metcha umai yan!" }
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
      { phrase: "Posta", meaning: "Really? / Truth.", usage: "Me compraron el auto. ¡Posta!" },
      { phrase: "Pibe / Mina", meaning: "Boy / Girl.", usage: "Esos pibes jugaban al fútbol todo el día." }
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
      { phrase: "Dog and bone", meaning: "Phone.", usage: "Get on the dog and bone, we need to call 'em!" },
      { phrase: "Barney Rubble", meaning: "Trouble.", usage: "Oh blimey, we are in a bit of Barney Rubble!" }
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
      { phrase: "頂呱呱 (Ding gwa gwa)", meaning: "Topnotch / Superb.", usage: "This food tastes ding gwa gwa!" },
      { phrase: "炒魷魚 (Chao yau yu)", meaning: "To be fired (literally 'frying squid').", usage: "He went late so many days, now he chao yau yu." }
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
      { phrase: "Tant qu'à faire", meaning: "Might as well", usage: "Tant qu'à faire, on mangera poutine!" },
      { phrase: "Lâche pas la patate", meaning: "Don't give up! Hang in there!", usage: "We are almost done, lâche pas la patate." }
    ],
    voiceId: "fr-CA",
    accentPrefix: "quebecois"
  }
};

export const SEED_PARTNERS: CallPartner[] = [
  {
    id: "partner-rajesh",
    name: "Rajesh Kumar",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    dialect: "hi-Bhojpuri",
    languageName: "Bhojpuri Hindi",
    backstory: "A cooperative wheat farmer and local advisor from rural Buxar, Bihar. He is eager to talk about organic fertilizers, harvest times, and local folk songs.",
    gender: "male",
    greeting: "प्रणाम भैया! रउआ सब खैरियत बा? (Greeting! Is everything fine with you?)",
    avatarColor: "bg-amber-600"
  },
  {
    id: "partner-yuki",
    name: "Yuki Tanaka",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    dialect: "ja-Kansai",
    languageName: "Kansai Japanese",
    backstory: "An energetic street food vendor from Dotonbori, Osaka. She makes the best takoyaki (octopus balls) and loves high-energy banter, comedy, and Osaka Tigers baseball.",
    gender: "female",
    greeting: "まいど！元気にしてる？たこ焼き食べていかへん？ (Hi there! Doing well? Won't you grab some takoyaki?)",
    avatarColor: "bg-emerald-600"
  },
  {
    id: "partner-carlos",
    name: "Carlos Mendez",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    dialect: "es-MX-Northern",
    languageName: "Mexican (Norteño)",
    backstory: "A ranch owner and cattle manager from Sonora, Mexico. He talks about traditional guitar arrangements, horse ranching, and delicious Sonoran-style grilled beef.",
    gender: "male",
    greeting: "¡Qué tal mi compa! ¿Cómo andamos en estas tierras? (How goes it my friend! How are we doing down here?)",
    avatarColor: "bg-sky-600"
  },
  {
    id: "partner-sofia",
    name: "Sofia Rossi",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    dialect: "es-AR-Rioplatense",
    languageName: "Argentinian",
    backstory: "A traditional tango choreographer and café owner from San Telmo, Buenos Aires. Talk to her about vintage vinyl records, soccer rivalries, and making perfect yerba mate tea.",
    gender: "female",
    greeting: "¡Che! Qué bueno hablar con vos. ¿Andás con ganas de un matecito? (Hey! So good to talk to you. Do you feel like a warm mate?)",
    avatarColor: "bg-pink-600"
  },
  {
    id: "partner-alfie",
    name: "Alfie 'Geezer' Higgins",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&auto=format&fit=crop&q=80",
    dialect: "en-GB-Cockney",
    languageName: "East London Cockney",
    backstory: "A traditional vegetable cart vendor and pub owner in Hackney, London. Full of cheeky local humor, rhyming riddles, and classic football tales.",
    gender: "male",
    greeting: "Alright mate? Get on the dog and bone, let's have a proper chinwag!",
    avatarColor: "bg-indigo-600"
  }
];
