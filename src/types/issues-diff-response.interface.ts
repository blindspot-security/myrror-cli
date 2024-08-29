import { IIssueResponse } from './issues-response.interface';
import { IPaginated } from './paginated.interface';

export interface IIssuesDiffResponse {
  issues: IPaginated<IIssueResponse>;
  message?: string;
}
