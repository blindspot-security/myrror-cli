import { IIssueResponse } from './issues-response.interface';

export interface IIssuesDiffResponse {
  issues: IIssueResponse[];
  message?: string;
}
