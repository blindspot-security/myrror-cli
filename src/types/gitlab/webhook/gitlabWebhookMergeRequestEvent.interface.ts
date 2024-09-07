export interface IGitlabWebhookMergeRequestEvent {
  body: {
    user: {
      name: string;
    };
    project: {
      id: string;
    };
    object_attributes: {
      created_at: string;
      id: string;
      iid: string;
      source_branch: string;
      target_branch: string;
      title: string;
      updated_at: string;
      last_commit: {
        id: string;
        message: string;
        title: string;
        timestamp: string;
        author: {
          name: string;
          email: string;
        };
      };
      state: string;
      url: string;
      // TODO: move to enum
      action: 'update';
    };
  };
  headers: Record<string, string>;
}
