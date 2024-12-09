import { DynamicModule, Module, Provider } from '@nestjs/common';
import { HttpRetryService } from './httpRetry.service';
import { HTTP_OPTIONS, HttpOptions, HttpAsyncOptions, HttpOptionsFactory } from './types';

@Module({
  providers: [HttpRetryService],
  exports: [HttpRetryService],
})
export class HttpRetryModule {
  public static register(connectOptions: HttpOptions): DynamicModule {
    return {
      module: HttpRetryModule,
      providers: [
        {
          provide: HTTP_OPTIONS,
          useValue: connectOptions,
        },
      ],
    };
  }

  public static registerAsync(connectOptions: HttpAsyncOptions): DynamicModule {
    return {
      module: HttpRetryModule,
      imports: connectOptions.imports || [],
      providers: this.createConnectProviders(connectOptions),
    };
  }

  private static createConnectProviders(options: HttpAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createConnectOptionsProvider(options)];
    }

    return [
      this.createConnectOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createConnectOptionsProvider(options: HttpAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: HTTP_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: HTTP_OPTIONS,
      useFactory: async (optionsFactory: HttpOptionsFactory) => await optionsFactory.createHttpConnectOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }
}
