import { AtlasNetworkError } from "../errors";

export interface HttpOptions {
  timeout: number;
  retries: number;
  retryDelay: number;
  headers?: Record<string, string>;
}

export class HttpClient {
  private options: HttpOptions;

  constructor(options: HttpOptions) {
    this.options = options;
  }

  async get(url: string, headers: Record<string, string> = {}): Promise<unknown> {
    return this.request(url, "GET", undefined, headers);
  }

  async post(
    url: string,
    data?: unknown,
    headers: Record<string, string> = {},
  ): Promise<unknown> {
    return this.request(url, "POST", data, headers);
  }

  private async request(
    url: string,
    method: string,
    data?: unknown,
    customHeaders: Record<string, string> = {},
  ): Promise<unknown> {
    const headers = { ...this.options.headers, ...customHeaders };

    for (let attempt = 0; attempt <= this.options.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          this.options.timeout,
        );

        const response = await fetch(url, {
          method,
          headers,
          body: data ? JSON.stringify(data) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new AtlasNetworkError(
            `HTTP ${response.status}: ${response.statusText}`,
          );
        }

        return await response.json();
      } catch (error) {
        if (attempt === this.options.retries) {
          throw error;
        }
        await this.delay(this.options.retryDelay);
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
