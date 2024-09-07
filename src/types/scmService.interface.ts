export interface IScmService {
  getWebhookUrl(): string;
  buildWebhookMergeRequestEvent(): { body: Record<string, any>; headers: Record<string, string> };
  buildWebhookPushEvent(): { body: Record<string, any>; headers: Record<string, string> };
}
