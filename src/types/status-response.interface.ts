import { EScanningStatus } from './scanning-status.enum';

export interface IStatusResponse {
  status: EScanningStatus;
  repoId?: string;
  branchId?: string;
  message?: string;
}
