import { IGitlabWebhookPushEventCommit } from './gitlabWebhookPushEventCommit.interface';

export interface IGitlabWebhookPushEvent {
  body: {
    ref: string;
    project: {
      id: string;
    };
    commits: IGitlabWebhookPushEventCommit[];
  };
  headers: Record<string, string>;
}
