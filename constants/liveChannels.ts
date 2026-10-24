export type ChannelCategory =
  | "ALL"
  | "NATIONAL"
  | "NEWS"
  | "SPORTS"
  | "CULTURE"
  | "REGIONAL";

export interface LiveChannel {
  id: string;
  name: string;
  hindiName: string;
  category: ChannelCategory;
  description: string;
  broadcaster: string;
  language: string[];
  streamUrl: string;
  logo: string;
  isFeatured?: boolean;
  currentProgram?: string;
  badgeText?: string;
}

export const CHANNEL_CATEGORIES: { id: ChannelCategory; label: string; hindiLabel: string }[] = [
  { id: "ALL", label: "All Channels", hindiLabel: "सभी चैनल" },
  { id: "NATIONAL", label: "National & Public", hindiLabel: "राष्ट्रीय" },
  { id: "NEWS", label: "News & Current Affairs", hindiLabel: "समाचार" },
  { id: "SPORTS", label: "Sports & Live Games", hindiLabel: "खेल" },
  { id: "CULTURE", label: "Culture & Education", hindiLabel: "संस्कृति व ज्ञान" },
  { id: "REGIONAL", label: "Regional & Classics", hindiLabel: "क्षेत्रीय" },
];

/**
 * Curated directory of official, legal Free-To-Air (FTA) Indian Live TV channels
 * Publicly broadcast by Prasar Bharati (Doordarshan), Parliament of India, and public news networks.
 */
export const INDIAN_LIVE_CHANNELS: LiveChannel[] = [
  {
    id: "dd-national",
    name: "DD National",
    hindiName: "डीडी नेशनल",
    category: "NATIONAL",
    description: "India's premier public broadcaster featuring cultural programs, national celebrations, family entertainment, and official national events.",
    broadcaster: "Prasar Bharati (Doordarshan)",
    language: ["Hindi", "English"],
    streamUrl: "https://d35j504z0x2vu2.cloudfront.net/v1/manifest/0bc8e8376c622963b83c076229b12271c7793d4a/dd-national/master.m3u8",
    logo: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=200&auto=format&fit=crop&q=80",
    isFeatured: true,
    currentProgram: "National Highlights & Special Broadcast",
    badgeText: "Prasar Bharati",
  },
  {
    id: "dd-news",
    name: "DD News",
    hindiName: "डीडी न्यूज़",
    category: "NEWS",
    description: "24x7 terrestrial national news channel broadcasting authentic, verified news, parliamentary debates, and international headlines.",
    broadcaster: "Prasar Bharati (Doordarshan)",
    language: ["Hindi", "English"],
    streamUrl: "https://d35j504z0x2vu2.cloudfront.net/v1/manifest/0bc8e8376c622963b83c076229b12271c7793d4a/dd-news/master.m3u8",
    logo: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=200&auto=format&fit=crop&q=80",
    isFeatured: true,
    currentProgram: "Live Prime News & National Analysis",
    badgeText: "24x7 News",
  },
  {
    id: "dd-sports",
    name: "DD Sports",
    hindiName: "डीडी स्पोर्ट्स",
    category: "SPORTS",
    description: "India's only dedicated free-to-air sports channel broadcasting live national athletics, cricket highlights, hockey, football, and grassroots sports.",
    broadcaster: "Prasar Bharati (Doordarshan)",
    language: ["Hindi", "English"],
    streamUrl: "https://d35j504z0x2vu2.cloudfront.net/v1/manifest/0bc8e8376c622963b83c076229b12271c7793d4a/dd-sports/master.m3u8",
    logo: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&auto=format&fit=crop&q=80",
    isFeatured: true,
    currentProgram: "Live National Sports Arena",
    badgeText: "Live Sports",
  },
  {
    id: "dd-india",
    name: "DD India",
    hindiName: "डीडी इंडिया",
    category: "NATIONAL",
    description: "International English-language news and current affairs channel representing India's global voice and strategic foreign relations.",
    broadcaster: "Prasar Bharati (Doordarshan)",
    language: ["English"],
    streamUrl: "https://d35j504z0x2vu2.cloudfront.net/v1/manifest/0bc8e8376c622963b83c076229b12271c7793d4a/dd-india/master.m3u8",
    logo: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&auto=format&fit=crop&q=80",
    isFeatured: true,
    currentProgram: "Global India: World Perspectives",
    badgeText: "International",
  },
  {
    id: "sansad-tv-loksabha",
    name: "Sansad TV - Lok Sabha",
    hindiName: "संसद टीवी (लोक सभा)",
    category: "NATIONAL",
    description: "Official broadcast of the Parliament of India featuring live Lok Sabha proceedings, legislative bills, and democratic discussions.",
    broadcaster: "Parliament of India",
    language: ["Hindi", "English"],
    streamUrl: "https://d35j504z0x2vu2.cloudfront.net/v1/manifest/0bc8e8376c622963b83c076229b12271c7793d4a/sansad-tv-loksabha/master.m3u8",
    logo: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=200&auto=format&fit=crop&q=80",
    currentProgram: "Parliamentary Proceedings & Policy Review",
    badgeText: "Parliament",
  },
  {
    id: "sansad-tv-rajyasabha",
    name: "Sansad TV - Rajya Sabha",
    hindiName: "संसद टीवी (राज्य सभा)",
    category: "NATIONAL",
    description: "Official broadcast of the Rajya Sabha (Council of States), national debates, constitutional debates, and governance documentaries.",
    broadcaster: "Parliament of India",
    language: ["Hindi", "English"],
    streamUrl: "https://d35j504z0x2vu2.cloudfront.net/v1/manifest/0bc8e8376c622963b83c076229b12271c7793d4a/sansad-tv-rajyasabha/master.m3u8",
    logo: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=200&auto=format&fit=crop&q=80",
    currentProgram: "Council of States: Legislative Sessions",
    badgeText: "Parliament",
  },
  {
    id: "wion-news",
    name: "WION (World Is One News)",
    hindiName: "वियॉन न्यूज़",
    category: "NEWS",
    description: "India's leading international news channel covering global geopolitics, world diplomacy, and south Asian affairs.",
    broadcaster: "Zee Media",
    language: ["English"],
    streamUrl: "https://d35j504z0x2vu2.cloudfront.net/v1/manifest/0bc8e8376c622963b83c076229b12271c7793d4a/wion/master.m3u8",
    logo: "https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=200&auto=format&fit=crop&q=80",
    isFeatured: true,
    currentProgram: "Gravitas: Global World Analysis",
    badgeText: "Global News",
  },
  {
    id: "ndtv-india",
    name: "NDTV India",
    hindiName: "एनडीटीवी इंडिया",
    category: "NEWS",
    description: "Credible and in-depth Hindi news channel known for analytical journalism, ground reports, and balanced discussions.",
    broadcaster: "NDTV Ltd",
    language: ["Hindi"],
    streamUrl: "https://d35j504z0x2vu2.cloudfront.net/v1/manifest/0bc8e8376c622963b83c076229b12271c7793d4a/ndtv-india/master.m3u8",
    logo: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=200&auto=format&fit=crop&q=80",
    currentProgram: "Prime Time Hindi Bulletin",
    badgeText: "Hindi News",
  },
  {
    id: "dd-kisan",
    name: "DD Kisan",
    hindiName: "डीडी किसान",
    category: "CULTURE",
    description: "Dedicated agricultural and rural empowerment channel supporting farmers with crop science, market prices, and weather forecasts.",
    broadcaster: "Prasar Bharati (Doordarshan)",
    language: ["Hindi"],
    streamUrl: "https://d35j504z0x2vu2.cloudfront.net/v1/manifest/0bc8e8376c622963b83c076229b12271c7793d4a/dd-kisan/master.m3u8",
    logo: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=200&auto=format&fit=crop&q=80",
    currentProgram: "Krishi Darshan & Smart Farming",
    badgeText: "Agriculture",
  },
  {
    id: "dd-bharati",
    name: "DD Bharati",
    hindiName: "डीडी भारती",
    category: "CULTURE",
    description: "Celebrates India's rich civilizational heritage, classical Indian music, Bharatanatyam, Kathak, literature, and Vedic philosophy.",
    broadcaster: "Prasar Bharati (Doordarshan)",
    language: ["Hindi", "Sanskrit", "English"],
    streamUrl: "https://d35j504z0x2vu2.cloudfront.net/v1/manifest/0bc8e8376c622963b83c076229b12271c7793d4a/dd-bharati/master.m3u8",
    logo: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&auto=format&fit=crop&q=80",
    currentProgram: "Classical Heritage & Sangeet Utsav",
    badgeText: "Arts & Culture",
  },
  {
    id: "dd-retro",
    name: "DD Retro",
    hindiName: "डीडी रेट्रो",
    category: "REGIONAL",
    description: "Relive golden era Indian television with timeless classic series, historic epics, drama, and vintage cinema.",
    broadcaster: "Prasar Bharati (Doordarshan)",
    language: ["Hindi"],
    streamUrl: "https://d35j504z0x2vu2.cloudfront.net/v1/manifest/0bc8e8376c622963b83c076229b12271c7793d4a/dd-retro/master.m3u8",
    logo: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&auto=format&fit=crop&q=80",
    currentProgram: "Golden Era Classics & Epics",
    badgeText: "Classics",
  },
  {
    id: "dd-urdu",
    name: "DD Urdu",
    hindiName: "डीडी उर्दू",
    category: "REGIONAL",
    description: "Infotainment channel broadcasting in Urdu with poetry, ghazals, Mushaira, cultural dramas, and regional history.",
    broadcaster: "Prasar Bharati (Doordarshan)",
    language: ["Urdu", "Hindi"],
    streamUrl: "https://d35j504z0x2vu2.cloudfront.net/v1/manifest/0bc8e8376c622963b83c076229b12271c7793d4a/dd-urdu/master.m3u8",
    logo: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=200&auto=format&fit=crop&q=80",
    currentProgram: "Urdu Mushaira & Cultural Heritage",
    badgeText: "Regional",
  },
];
