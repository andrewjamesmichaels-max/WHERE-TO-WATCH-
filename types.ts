
export interface StreamingOption {
  service: string;
  type: 'subscription' | 'rent' | 'buy' | 'cinema';
  url?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface WatchResult {
  title: string;
  year?: string;
  overview?: string;
  posterUrl?: string;
  options: StreamingOption[];
  sources: GroundingSource[];
}

export interface SearchFilters {
  genres: string[];
  services: string[];
  yearFrom: string;
  yearTo: string;
}

export interface AppState {
  query: string;
  loading: boolean;
  result: WatchResult | null;
  error: string | null;
  showFilters: boolean;
  filters: SearchFilters;
  location: {
    city: string | null;
    country: string | null;
    coords: { latitude: number; longitude: number } | null;
  };
}
