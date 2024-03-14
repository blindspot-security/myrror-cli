import { IPageMeta } from './page-meta.interface';

export interface IPaginated<T> {
  readonly data: T[];

  readonly meta: IPageMeta;
}
