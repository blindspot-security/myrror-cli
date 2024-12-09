export interface HttpOptions {
  baseURL: string;
  timeout?: number;
  maxRedirects?: number;
  retry?: number;
  retryDelay?: number;
}
