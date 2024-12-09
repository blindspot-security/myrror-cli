import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import Axios, { AxiosRequestConfig } from 'axios';
import { HttpOptions, HTTP_OPTIONS } from './types';

@Injectable()
export class HttpRetryService extends HttpService {
  private readonly logger = new Logger(HttpRetryService.name);

  constructor(@Inject(HTTP_OPTIONS) protected readonly options: HttpOptions) {
    super(
      Axios.create({
        retry: 5,
        retryDelay: 1000 * 10,
        retryIndex: 0,
        ...options,
      } as AxiosRequestConfig<HttpOptions>),
    );

    this.axiosRef.interceptors.response.use(undefined, (err) => {
      const { config } = err;
      if (!config || config.retryIndex >= config.retry) {
        return Promise.reject(err);
      }

      config.retryIndex += 1;
      const delayRetryRequest = new Promise((resolve) => {
        setTimeout(() => {
          this.logger.debug(`Axios retry ${config.retryIndex} of request`);
          resolve(true);
        }, config.retryDelay * config.retryIndex);
      });
      return delayRetryRequest.then(() => this.axiosRef(config));
    });
  }
}
