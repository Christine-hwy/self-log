import { MediaFile, TravelMemory } from '../../data/site';
import { worldLocations, WorldLocation } from '../../data/worldLocations';

export interface VoiceFootprintDraft {
  location: string;
  lat: number;
  lng: number;
  date: string;
  description: string;
  photos: MediaFile[];
  videos: MediaFile[];
}

interface LocationAlias {
  alias: string;
  location: WorldLocation;
}

const locationAliases: LocationAlias[] = [
  ...worldLocations.map((location) => ({
    alias: location.name.toLowerCase(),
    location
  })),
  { alias: '北京', location: findLocation('Beijing') },
  { alias: '故宫', location: findLocation('Beijing') },
  { alias: '长城', location: findLocation('Beijing') },
  { alias: '上海', location: findLocation('Shanghai') },
  { alias: '外滩', location: findLocation('Shanghai') },
  { alias: '迪士尼', location: findLocation('Shanghai') },
  { alias: '广州', location: findLocation('Guangzhou') },
  { alias: '广州塔', location: findLocation('Guangzhou') },
  { alias: '深圳', location: findLocation('Shenzhen') },
  { alias: '香港', location: findLocation('Hong Kong') },
  { alias: '杭州', location: findLocation('Hangzhou') },
  { alias: '西湖', location: findLocation('Hangzhou') },
  { alias: '成都', location: findLocation('Chengdu') },
  { alias: '重庆', location: findLocation('Chongqing') },
  { alias: '武汉', location: findLocation('Wuhan') },
  { alias: '台北', location: findLocation('Taipei') },
  { alias: '澳门', location: findLocation('Macau') },
  { alias: '东京', location: findLocation('Tokyo') },
  { alias: '涩谷', location: findLocation('Tokyo') },
  { alias: '首尔', location: findLocation('Seoul') },
  { alias: '曼谷', location: findLocation('Bangkok') },
  { alias: '新加坡', location: findLocation('Singapore') },
  { alias: '巴黎', location: findLocation('Paris') },
  { alias: '埃菲尔', location: findLocation('Paris') },
  { alias: '伦敦', location: findLocation('London') },
  { alias: '大本钟', location: findLocation('London') },
  { alias: '纽约', location: findLocation('New York') },
  { alias: '时代广场', location: findLocation('New York') },
  { alias: '悉尼', location: findLocation('Sydney') }
];

export function buildFootprintFromSpeech(
  transcript: string,
  media: { photos: MediaFile[]; videos: MediaFile[] }
): VoiceFootprintDraft | null {
  const matchedLocation = matchLocation(transcript);

  if (!matchedLocation) {
    return null;
  }

  return {
    location: matchedLocation.name,
    lat: matchedLocation.lat,
    lng: matchedLocation.lng,
    date: inferMonth(transcript),
    description: buildDescription(transcript, matchedLocation.name, media),
    photos: media.photos,
    videos: media.videos
  };
}

export function persistMemories(memories: TravelMemory[]) {
  window.localStorage.setItem('journey.memories', JSON.stringify(memories));
}

export function readPersistedMemories(fallback: TravelMemory[]) {
  try {
    const raw = window.localStorage.getItem('journey.memories');
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as TravelMemory[];
    if (!Array.isArray(parsed)) return fallback;

    return parsed;
  } catch {
    return fallback;
  }
}

function findLocation(name: string) {
  const location = worldLocations.find((item) => item.name === name);
  if (!location) {
    throw new Error(`Missing location seed: ${name}`);
  }

  return location;
}

function matchLocation(transcript: string) {
  const normalized = transcript.toLowerCase();

  const match = locationAliases
    .filter(({ alias }) => normalized.includes(alias))
    .sort((a, b) => b.alias.length - a.alias.length)[0];

  return match?.location ?? null;
}

function inferMonth(transcript: string) {
  const now = new Date();

  if (/去年|last year/i.test(transcript)) {
    return formatMonth(new Date(now.getFullYear() - 1, now.getMonth(), 1));
  }

  const monthMatch = transcript.match(/(20\d{2})[-/.年](\d{1,2})/);
  if (monthMatch) {
    return `${monthMatch[1]}-${monthMatch[2].padStart(2, '0')}`;
  }

  return formatMonth(now);
}

function formatMonth(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function buildDescription(
  transcript: string,
  location: string,
  media: { photos: MediaFile[]; videos: MediaFile[] }
) {
  const mediaText = [
    media.photos.length > 0 ? `${media.photos.length} photos` : '',
    media.videos.length > 0 ? `${media.videos.length} videos` : ''
  ]
    .filter(Boolean)
    .join(' and ');

  const suffix = mediaText ? ` Attached ${mediaText}.` : '';
  return `${transcript.trim() || `A new footprint in ${location}.`}${suffix}`;
}
