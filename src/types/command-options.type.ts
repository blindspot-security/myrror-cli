export type CommandOptions = {
  repository: string;
  branch: string;
  commit: string;
  rootNamespace?: string;
  pullRequestIid?: string;
  repoOriginId?: string;
  enabledSyntheticWebhooks?: boolean;
};
