import { HttpOptions } from './httpOptions.interface';

export interface HttpOptionsFactory {
  createHttpConnectOptions(): Promise<HttpOptions> | HttpOptions;
}
