export interface IGitlabWebhookPushEventCommit {
  id: string;
  message: string;
  title: string;
  timestamp: string;
  author: {
    name: string;
    email: string;
  };
}
