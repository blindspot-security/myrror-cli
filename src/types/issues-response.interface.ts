import { EIssueSubType } from './issue-sub-type.enum';
import { ESeverityLevel } from './severity-level.enum';

export interface IIssueResponse {
  uuid: string;
  name: string;
  severity: ESeverityLevel;
  category: EIssueSubType;
  dependencyName: string;
  dependencyInstalledVersion: string;
  reachabilityStatus: string;
  fixedVersion: string[];
}
