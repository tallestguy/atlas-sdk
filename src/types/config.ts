export interface AtlasClientConfig {
  apiUrl: string;
  websiteId: string;
  apiKey?: string;
  timeout?: number;
  cache?: boolean;
  cacheDuration?: number; // in minutes
  retries?: number;
  retryDelay?: number;
}

export interface AtlasClientOptions {
  config: AtlasClientConfig;
  debug?: boolean;
}
