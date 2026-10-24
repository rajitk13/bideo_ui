export type ChannelCategory =
  | "ALL"
  | "NATIONAL"
  | "NEWS"
  | "SPORTS"
  | "CULTURE"
  | "REGIONAL";

export interface LiveChannel {
  id: string;
  channelNumber: string;
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
  resolution?: string;
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
 * Powered by high-speed adaptive HLS streams.
 */
export const INDIAN_LIVE_CHANNELS: LiveChannel[] = [
  {
    id: "dd-national",
    channelNumber: "01",
    name: "DD National",
    hindiName: "डीडी नेशनल",
    category: "NATIONAL",
    description: "India's premier public broadcaster featuring cultural programs, national celebrations, family entertainment, and official national events.",
    broadcaster: "Prasar Bharati (Doordarshan)",
    language: ["Hindi", "English"],
    streamUrl: "https://d2lk5u59tns74c.cloudfront.net/out/v1/29c92e0bef954a6d9b0908d1be29c1f0/index.m3u8",
    logo: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=200&auto=format&fit=crop&q=80",
    isFeatured: true,
    currentProgram: "National Highlights & Special Broadcast",
    badgeText: "Prasar Bharati",
    resolution: "1080p HD",
  },
  {
    id: "dd-news",
    channelNumber: "02",
    name: "DD News",
    hindiName: "डीडी न्यूज़",
    category: "NEWS",
    description: "24x7 terrestrial national news channel broadcasting authentic, verified news, parliamentary debates, and international headlines.",
    broadcaster: "Prasar Bharati (Doordarshan)",
    language: ["Hindi", "English"],
    streamUrl: "https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/0811cd8c37ca4c409d5385a6cd2fa18b/index.m3u8",
    logo: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=200&auto=format&fit=crop&q=80",
    isFeatured: true,
    currentProgram: "Live Prime News & National Analysis",
    badgeText: "24x7 News",
    resolution: "1080p HD",
  },
  {
    id: "dd-sports",
    channelNumber: "03",
    name: "DD Sports",
    hindiName: "डीडी स्पोर्ट्स",
    category: "SPORTS",
    description: "India's only dedicated free-to-air sports channel broadcasting live national athletics, cricket highlights, hockey, football, and grassroots sports.",
    broadcaster: "Prasar Bharati (Doordarshan)",
    language: ["Hindi", "English"],
    streamUrl: "https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/b17adfe543354fdd8d189b110617cddd/index.m3u8",
    logo: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&auto=format&fit=crop&q=80",
    isFeatured: true,
    currentProgram: "Live National Sports Arena",
    badgeText: "Live Sports",
    resolution: "1080p HD",
  },
  {
    id: "dd-india",
    channelNumber: "04",
    name: "DD India",
    hindiName: "डीडी इंडिया",
    category: "NATIONAL",
    description: "International English-language news and current affairs channel representing India's global voice and strategic foreign relations.",
    broadcaster: "Prasar Bharati (Doordarshan)",
    language: ["English"],
    streamUrl: "https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/afd2e335b0ba40eb9bdf1096118c6ede/index.m3u8",
    logo: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&auto=format&fit=crop&q=80",
    isFeatured: true,
    currentProgram: "Global India: World Perspectives",
    badgeText: "International",
    resolution: "1080p HD",
  },
  {
    id: "sansad-tv-loksabha",
    channelNumber: "05",
    name: "Sansad TV - Lok Sabha",
    hindiName: "संसद टीवी (लोक सभा)",
    category: "NATIONAL",
    description: "Official broadcast of the Parliament of India featuring live Lok Sabha proceedings, legislative bills, and democratic discussions.",
    broadcaster: "Parliament of India",
    language: ["Hindi", "English"],
    streamUrl: "https://d2lk5u59tns74c.cloudfront.net/out/v1/fff8f20221d5456e8922e689d71dedc3/index.m3u8",
    logo: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=200&auto=format&fit=crop&q=80",
    currentProgram: "Parliamentary Proceedings & Policy Review",
    badgeText: "Parliament",
    resolution: "1080p HD",
  },
  {
    id: "sansad-tv-rajyasabha",
    channelNumber: "06",
    name: "Sansad TV - Rajya Sabha",
    hindiName: "संसद टीवी (राज्य सभा)",
    category: "NATIONAL",
    description: "Official broadcast of the Rajya Sabha (Council of States), national debates, constitutional debates, and governance documentaries.",
    broadcaster: "Parliament of India",
    language: ["Hindi", "English"],
    streamUrl: "https://d2lk5u59tns74c.cloudfront.net/out/v1/e4182054dce340da9e0ff38b6b3658a4/index.m3u8",
    logo: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=200&auto=format&fit=crop&q=80",
    currentProgram: "Council of States: Legislative Sessions",
    badgeText: "Parliament",
    resolution: "1080p HD",
  },
  {
    id: "zee-news",
    channelNumber: "07",
    name: "Zee News Live",
    hindiName: "ज़ी न्यूज़",
    category: "NEWS",
    description: "Major Indian national 24/7 news channel covering breaking headlines, politics, economy, and national stories across India.",
    broadcaster: "Zee Media",
    language: ["Hindi"],
    streamUrl: "https://dknttpxmr0dwf.cloudfront.net/index_57.m3u8",
    logo: "https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=200&auto=format&fit=crop&q=80",
    isFeatured: true,
    currentProgram: "Rashtriya Khabrein & Prime News",
    badgeText: "National News",
    resolution: "720p HD",
  },
  {
    id: "ndtv-india",
    channelNumber: "08",
    name: "NDTV India",
    hindiName: "एनडीटीवी इंडिया",
    category: "NEWS",
    description: "Credible and in-depth Hindi news channel known for analytical journalism, ground reports, and balanced discussions.",
    broadcaster: "NDTV Ltd",
    language: ["Hindi"],
    streamUrl: "https://raw.githubusercontent.com/amazeyourself/adaptive-streams/refs/heads/main/streams/in/YuppTV/NDTVIndia.m3u8",
    logo: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=200&auto=format&fit=crop&q=80",
    currentProgram: "Prime Time Hindi Bulletin",
    badgeText: "Hindi News",
    resolution: "720p HD",
  },
  {
    id: "dd-kisan",
    channelNumber: "09",
    name: "DD Kisan",
    hindiName: "डीडी किसान",
    category: "CULTURE",
    description: "Dedicated agricultural and rural empowerment channel supporting farmers with crop science, market prices, and weather forecasts.",
    broadcaster: "Prasar Bharati (Doordarshan)",
    language: ["Hindi"],
    streamUrl: "https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/8a59a828e80c49d0958925950cec0204/index.m3u8",
    logo: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=200&auto=format&fit=crop&q=80",
    currentProgram: "Krishi Darshan & Smart Farming",
    badgeText: "Agriculture",
    resolution: "1080p HD",
  },
  {
    id: "dd-bharati",
    channelNumber: "10",
    name: "DD Bharati",
    hindiName: "डीडी भारती",
    category: "CULTURE",
    description: "Celebrates India's rich civilizational heritage, classical Indian music, Bharatanatyam, Kathak, literature, and Vedic philosophy.",
    broadcaster: "Prasar Bharati (Doordarshan)",
    language: ["Hindi", "Sanskrit", "English"],
    streamUrl: "https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/7ff57cc9046b4c188b51a0d506f36e7f/index.m3u8",
    logo: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&auto=format&fit=crop&q=80",
    currentProgram: "Classical Heritage & Sangeet Utsav",
    badgeText: "Arts & Culture",
    resolution: "1080p HD",
  },
  {
    id: "dd-retro",
    channelNumber: "11",
    name: "DD Retro",
    hindiName: "डीडी रेट्रो",
    category: "REGIONAL",
    description: "Relive golden era Indian television with timeless classic series, historic epics, drama, and vintage cinema.",
    broadcaster: "Prasar Bharati (Doordarshan)",
    language: ["Hindi"],
    streamUrl: "https://d2lk5u59tns74c.cloudfront.net/out/v1/29c92e0bef954a6d9b0908d1be29c1f0/index.m3u8",
    logo: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&auto=format&fit=crop&q=80",
    currentProgram: "Golden Era Classics & Epics",
    badgeText: "Classics",
    resolution: "1080p HD",
  },
  {
    id: "dd-urdu",
    channelNumber: "12",
    name: "DD Urdu",
    hindiName: "डीडी उर्दू",
    category: "REGIONAL",
    description: "Infotainment channel broadcasting in Urdu with poetry, ghazals, Mushaira, cultural dramas, and regional history.",
    broadcaster: "Prasar Bharati (Doordarshan)",
    language: ["Urdu", "Hindi"],
    streamUrl: "https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/0811cd8c37ca4c409d5385a6cd2fa18b/index.m3u8",
    logo: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=200&auto=format&fit=crop&q=80",
    currentProgram: "Urdu Mushaira & Cultural Heritage",
    badgeText: "Regional",
    resolution: "1080p HD",
  },
];
