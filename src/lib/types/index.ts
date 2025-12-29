// Cloud Code Type Definitions
// Re-exported from Prisma and custom types

export type {
  Organization,
  User,
  UserRole,
  Venue,
  Zone,
  ZoneStatus,
  Track,
  Playlist,
  PlaylistTrack,
  ScheduleBlock,
  Message,
  MessageType,
  MessageSchedule,
  WeatherRule,
  NowPlaying,
  AuditLog
} from '@prisma/client';

// ============================================================================
// Audio Engine Types
// ============================================================================

export interface AudioState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  currentTrack: TrackInfo | null;
  queue: TrackInfo[];
  volume: number;
  isMuted: boolean;
  position: number;
  duration: number;
  error: string | null;
}

export interface TrackInfo {
  id: string;
  title: string;
  artist: string | null;
  album: string | null;
  duration: number;
  fileUrl: string;
  coverUrl: string | null;
}

export interface CrossfadeConfig {
  duration: number;       // Crossfade duration in seconds (default: 0.035)
  equalPower: boolean;    // Use equal power curve
}

export interface DuckingConfig {
  duckLevel: number;      // Volume during ducking (0-1, default: 0.15)
  attackTime: number;     // Fade down time in seconds (default: 0.3)
  holdTime: number;       // Minimum hold before release (default: 0.1)
  releaseTime: number;    // Fade up time in seconds (default: 0.5)
}

// ============================================================================
// Scheduling Types
// ============================================================================

export interface ScheduleEntry {
  id: string;
  playlistId: string;
  playlistName: string;
  startTime: Date;
  endTime: Date;
  priority: number;
  isWeatherOverride?: boolean;
}

export interface RecurrenceRule {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval?: number;
  byweekday?: number[];   // 0=Mon, 6=Sun (rrule.js format)
  bymonthday?: number[];
  until?: Date;
  count?: number;
}

export interface ConflictResolution {
  winner: ScheduleEntry;
  losers: ScheduleEntry[];
  splitBlocks?: ScheduleEntry[];
}

// ============================================================================
// Weather Types
// ============================================================================

export interface WeatherCondition {
  type: 'weather_code' | 'temperature_above' | 'temperature_below' | 'humidity_above' | 'humidity_below' | 'wind_above';
  operator: 'equals' | 'in' | 'gt' | 'lt' | 'gte' | 'lte';
  value: string | number | number[];
}

export interface WeatherData {
  code: number;
  description: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  uvIndex: number;
  timestamp: Date;
}

// Weather code ranges (Open-Meteo/WMO)
export const WEATHER_CODES = {
  CLEAR: [0, 1],
  PARTLY_CLOUDY: [2],
  CLOUDY: [3],
  FOG: [45, 48],
  DRIZZLE: [51, 53, 55, 56, 57],
  RAIN: [61, 63, 65, 66, 67, 80, 81, 82],
  SNOW: [71, 73, 75, 77, 85, 86],
  THUNDERSTORM: [95, 96, 99]
} as const;

// ============================================================================
// Real-time / MQTT Types
// ============================================================================

export interface ZoneCommand {
  type: 'play' | 'pause' | 'stop' | 'skip' | 'volume' | 'seek' | 'playlist';
  payload?: {
    volume?: number;
    position?: number;
    playlistId?: string;
  };
  timestamp: number;
}

export interface ZoneStatusUpdate {
  zoneId: string;
  status: 'online' | 'offline' | 'playing' | 'paused' | 'error';
  currentTrack?: TrackInfo;
  position?: number;
  volume?: number;
  timestamp: number;
}

export interface MQTTTopics {
  status: string;      // cloudcode/org/{orgId}/venues/{venueId}/zones/{zoneId}/status
  command: string;     // cloudcode/org/{orgId}/venues/{venueId}/zones/{zoneId}/command
  nowPlaying: string;  // cloudcode/org/{orgId}/venues/{venueId}/zones/{zoneId}/now_playing
  schedule: string;    // cloudcode/org/{orgId}/venues/{venueId}/zones/{zoneId}/schedule
}

// ============================================================================
// OPFS Cache Types
// ============================================================================

export interface CachedTrack {
  id: string;
  size: number;
  cachedAt: number;
  lastAccessedAt: number;
  expiresAt?: number;
}

export interface CacheStatus {
  used: number;
  quota: number;
  percent: number;
  trackCount: number;
}

export interface PrefetchConfig {
  lookAheadHours: number;    // How far ahead to cache (default: 4)
  maxCacheSize: number;      // Max bytes (default: 500MB)
  networkThreshold: 'wifi' | 'any';
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// UI Component Props
// ============================================================================

export interface PlayerControlsProps {
  isPlaying: boolean;
  volume: number;
  position: number;
  duration: number;
  onPlay: () => void;
  onPause: () => void;
  onSkip: () => void;
  onVolumeChange: (volume: number) => void;
  onSeek: (position: number) => void;
}

export interface ScheduleBlockProps {
  id: string;
  playlistId: string;
  playlistName: string;
  startTime: string;
  endTime: string;
  color?: string;
  isDragging?: boolean;
  isConflict?: boolean;
}
