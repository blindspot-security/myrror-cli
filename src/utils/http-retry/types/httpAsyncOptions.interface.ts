import { ModuleMetadata, Type } from '@nestjs/common';
import { HttpOptions } from './httpOptions.interface';
import { HttpOptionsFactory } from './httpOptionsFactory.interface';

export interface HttpAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useExisting?: Type<HttpOptionsFactory>;
  useClass?: Type<HttpOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<HttpOptions> | HttpOptions;
}
