export interface Channel {
  id: string;
  name: string;
  url: string;
  country: string;
  countryCode: string;
  logo?: string;
}

const COUNTRY_NAMES: { [key: string]: string } = {
  ad: 'Andorra',
  ae: 'United Arab Emirates',
  af: 'Afghanistan',
  ag: 'Antigua and Barbuda',
  al: 'Albania',
  am: 'Armenia',
  ao: 'Angola',
  ar: 'Argentina',
  at: 'Austria',
  au: 'Australia',
  az: 'Azerbaijan',
  ba: 'Bosnia and Herzegovina',
  bb: 'Barbados',
  bd: 'Bangladesh',
  be: 'Belgium',
  bf: 'Burkina Faso',
  bg: 'Bulgaria',
  bh: 'Bahrain',
  bi: 'Burundi',
  bj: 'Benin',
  bm: 'Bermuda',
  bn: 'Brunei',
  bo: 'Bolivia',
  br: 'Brazil',
  bs: 'Bahamas',
  bt: 'Bhutan',
  bw: 'Botswana',
  by: 'Belarus',
  bz: 'Belize',
  ca: 'Canada',
  cd: 'DR Congo',
  cf: 'Central African Republic',
  cg: 'Congo',
  ch: 'Switzerland',
  ci: 'Ivory Coast',
  cl: 'Chile',
  cm: 'Cameroon',
  cn: 'China',
  co: 'Colombia',
  cr: 'Costa Rica',
  cu: 'Cuba',
  cv: 'Cape Verde',
  cy: 'Cyprus',
  cz: 'Czech Republic',
  de: 'Germany',
  dj: 'Djibouti',
  dk: 'Denmark',
  dm: 'Dominica',
  do: 'Dominican Republic',
  dz: 'Algeria',
  ec: 'Ecuador',
  ee: 'Estonia',
  eg: 'Egypt',
  er: 'Eritrea',
  es: 'Spain',
  et: 'Ethiopia',
  fi: 'Finland',
  fj: 'Fiji',
  fr: 'France',
  ga: 'Gabon',
  gb: 'United Kingdom',
  gd: 'Grenada',
  ge: 'Georgia',
  gh: 'Ghana',
  gm: 'Gambia',
  gn: 'Guinea',
  gq: 'Equatorial Guinea',
  gr: 'Greece',
  gt: 'Guatemala',
  gw: 'Guinea-Bissau',
  gy: 'Guyana',
  hn: 'Honduras',
  hr: 'Croatia',
  ht: 'Haiti',
  hu: 'Hungary',
  id: 'Indonesia',
  ie: 'Ireland',
  il: 'Israel',
  in: 'India',
  iq: 'Iraq',
  ir: 'Iran',
  is: 'Iceland',
  it: 'Italy',
  jm: 'Jamaica',
  jo: 'Jordan',
  jp: 'Japan',
  ke: 'Kenya',
  kg: 'Kyrgyzstan',
  kh: 'Cambodia',
  km: 'Comoros',
  kp: 'North Korea',
  kr: 'South Korea',
  kw: 'Kuwait',
  kz: 'Kazakhstan',
  la: 'Laos',
  lb: 'Lebanon',
  lc: 'Saint Lucia',
  li: 'Liechtenstein',
  lk: 'Sri Lanka',
  lr: 'Liberia',
  ls: 'Lesotho',
  lt: 'Lithuania',
  lu: 'Luxembourg',
  lv: 'Latvia',
  ly: 'Libya',
  ma: 'Morocco',
  mc: 'Monaco',
  md: 'Moldova',
  me: 'Montenegro',
  mg: 'Madagascar',
  mk: 'North Macedonia',
  ml: 'Mali',
  mm: 'Myanmar',
  mn: 'Mongolia',
  mr: 'Mauritania',
  mt: 'Malta',
  mu: 'Mauritius',
  mv: 'Maldives',
  mw: 'Malawi',
  mx: 'Mexico',
  my: 'Malaysia',
  mz: 'Mozambique',
  na: 'Namibia',
  ne: 'Niger',
  ng: 'Nigeria',
  ni: 'Nicaragua',
  nl: 'Netherlands',
  no: 'Norway',
  np: 'Nepal',
  nz: 'New Zealand',
  om: 'Oman',
  pa: 'Panama',
  pe: 'Peru',
  pg: 'Papua New Guinea',
  ph: 'Philippines',
  pk: 'Pakistan',
  pl: 'Poland',
  pt: 'Portugal',
  pw: 'Palau',
  py: 'Paraguay',
  qa: 'Qatar',
  ro: 'Romania',
  rs: 'Serbia',
  ru: 'Russia',
  rw: 'Rwanda',
  sa: 'Saudi Arabia',
  sc: 'Seychelles',
  sd: 'Sudan',
  se: 'Sweden',
  sg: 'Singapore',
  si: 'Slovenia',
  sk: 'Slovakia',
  sl: 'Sierra Leone',
  sn: 'Senegal',
  so: 'Somalia',
  sr: 'Suriname',
  ss: 'South Sudan',
  sv: 'El Salvador',
  sy: 'Syria',
  sz: 'Eswatini',
  td: 'Chad',
  tg: 'Togo',
  th: 'Thailand',
  tj: 'Tajikistan',
  tl: 'Timor-Leste',
  tm: 'Turkmenistan',
  tn: 'Tunisia',
  tr: 'Turkey',
  tt: 'Trinidad and Tobago',
  tw: 'Taiwan',
  tz: 'Tanzania',
  ua: 'Ukraine',
  ug: 'Uganda',
  us: 'United States',
  uy: 'Uruguay',
  uz: 'Uzbekistan',
  ve: 'Venezuela',
  vn: 'Vietnam',
  ws: 'Samoa',
  ye: 'Yemen',
  za: 'South Africa',
  zm: 'Zambia',
  zw: 'Zimbabwe',
};

const CHANNEL_CACHE_KEY = 'channel_cache_v1';
const CHANNEL_CACHE_TTL = 1000 * 60 * 60 * 24;
const MIN_CONCURRENCY = 4;
const MAX_CONCURRENCY = 16;
const FALLBACK_CONCURRENCY = 8;

interface ChannelCachePayload {
  timestamp: number;
  channels: Channel[];
}

const getCachePayload = (): ChannelCachePayload | null => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  try {
    const cached = window.localStorage.getItem(CHANNEL_CACHE_KEY);
    if (!cached) return null;
    return JSON.parse(cached) as ChannelCachePayload;
  } catch (error) {
    console.warn('Unable to read channel cache:', error);
    return null;
  }
};

const isCacheFresh = (payload: ChannelCachePayload | null): payload is ChannelCachePayload => {
  if (!payload) return false;
  return Date.now() - payload.timestamp < CHANNEL_CACHE_TTL;
};

const writeCachePayload = (channels: Channel[]) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    const payload: ChannelCachePayload = {
      timestamp: Date.now(),
      channels,
    };
    window.localStorage.setItem(CHANNEL_CACHE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('Unable to store channel cache:', error);
  }
};

const resolveConcurrency = (total: number): number => {
  if (total <= 1) return total || 1;

  if (typeof navigator !== 'undefined' && typeof navigator.hardwareConcurrency === 'number') {
    const suggested = Math.floor(navigator.hardwareConcurrency);
    const clamped = Math.max(
      MIN_CONCURRENCY,
      Math.min(MAX_CONCURRENCY, suggested || FALLBACK_CONCURRENCY)
    );
    return Math.min(total, Math.max(1, clamped));
  }

  return Math.min(total, FALLBACK_CONCURRENCY);
};

export const parseM3U = async (m3uContent: string, countryCode: string): Promise<Channel[]> => {
  const channels: Channel[] = [];
  const lines = m3uContent.split('\n');
  const countryName = COUNTRY_NAMES[countryCode.toLowerCase()] || countryCode.toUpperCase();

  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i].trim();
    if (line.startsWith('#EXTINF:')) {
      const urlLine = lines[i + 1].trim();
      if (urlLine && !urlLine.startsWith('#')) {
        // Extract channel name from #EXTINF line
        const nameMatch = line.match(/tvg-name="(.*?)"/) || line.match(/,(.*?)(?=\s*$)/);
        const name = nameMatch ? nameMatch[1] : `Channel ${channels.length + 1}`;

        // Clean up the name (remove resolution info in parentheses)
        const cleanName = name.replace(/\s*\([^)]*\)$/, '').trim();

        // Create a URL object to handle any encoding issues
        let finalUrl = urlLine;
        try {
          const url = new URL(urlLine);
          // If the URL is valid, use it as is
          finalUrl = url.toString();
        } catch (e) {
          // If URL is invalid, try to encode it
          try {
            const encodedUrl = encodeURI(urlLine);
            new URL(encodedUrl); // Test if it's a valid URL
            finalUrl = encodedUrl;
          } catch (e) {
            // Skip invalid URLs
            continue;
          }
        }

        // Skip if URL doesn't look like a stream
        if (!finalUrl.match(/\.(m3u8|mp4|mpd|ts|m3u8\?|mp4\?|mpd\?|ts\?)/i)) {
          continue;
        }

        channels.push({
          id: `${countryCode.toLowerCase()}_${channels.length}`,
          name: cleanName,
          url: finalUrl,
          country: countryName,
          countryCode: countryCode.toLowerCase(),
        });
      }
    }
  }

  return channels;
};

export const fetchAndParseM3U = async (url: string, countryCode: string): Promise<Channel[]> => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const content = await response.text();
    return parseM3U(content, countryCode);
  } catch (error) {
    console.error(`Error fetching M3U from ${url}:`, error);
    return [];
  }
};

export const loadAllChannels = async (): Promise<Channel[]> => {
  const cachedPayload = getCachePayload();
  const fallbackChannels = cachedPayload?.channels ?? [];

  if (isCacheFresh(cachedPayload) && fallbackChannels.length) {
    return fallbackChannels;
  }

  try {
    const resp = await fetch('/api/channels');
    if (resp.ok) {
      const data = await resp.json();
      const apiChannels = Array.isArray(data?.channels) ? (data.channels as Channel[]) : [];
      if (apiChannels.length) {
        writeCachePayload(apiChannels);
        return apiChannels;
      }
    }
  } catch {}

  const allChannels: Channel[] = [];
  const countryCodes = Object.keys(COUNTRY_NAMES);
  const totalCountries = countryCodes.length;
  const concurrency = Math.max(1, resolveConcurrency(totalCountries));
  let nextIndex = 0;

  const worker = async () => {
    while (true) {
      const currentIndex = nextIndex++;
      if (currentIndex >= totalCountries) {
        break;
      }
      const countryCode = countryCodes[currentIndex];
      const channels = await fetchAndParseM3U(`/streams/${countryCode}.m3u`, countryCode);
      if (channels.length) {
        allChannels.push(...channels);
      }
    }
  };

  await Promise.all(Array.from({ length: concurrency }, worker));

  if (allChannels.length) {
    writeCachePayload(allChannels);
    return allChannels;
  }

  return fallbackChannels;
};
