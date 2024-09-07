import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { IGitlabWebhookMergeRequestEvent, IGitlabWebhookPushEvent } from 'src/types/gitlab/webhook';

@Injectable()
export class GitlabService {
  constructor(private configService: ConfigService) {}

  getWebhookUrl(): string {
    const apiUrl = this.configService.get<string>('app.apiUrl');
    return `${apiUrl}/gitlab/webhooks/cli`;
  }

  buildWebhookPushEvent(): IGitlabWebhookPushEvent {
    const headers: IGitlabWebhookPushEvent['headers'] = {
      'x-gitlab-event': 'Push Hook',
      'x-gitlab-event-uuid': uuidv4(),
    };

    const commitAuthor = this.configService.get<string>('app.commitAuthor');
    const { name: commitAuthorName, email: commitAuthorEmail } = this.parseCommitAuthor(commitAuthor);

    const body: IGitlabWebhookPushEvent['body'] = {
      ref: this.configService.get<string>('app.branch'),
      project: {
        id: this.configService.get<string>('app.projectId'),
      },
      commits: [
        {
          id: this.configService.get<string>('app.commit'),
          message: this.configService.get<string>('app.commit'),
          title: this.configService.get<string>('app.commitTitle'),
          timestamp: this.configService.get<string>('app.commitTimestamp'),
          author: {
            name: commitAuthorName,
            email: commitAuthorEmail,
          },
        },
      ],
    };

    return { body, headers };
  }

  buildWebhookMergeRequestEvent(): IGitlabWebhookMergeRequestEvent {
    const headers: IGitlabWebhookMergeRequestEvent['headers'] = {
      'x-gitlab-event': 'Merge Request Hook',
      'x-gitlab-event-uuid': uuidv4(),
    };

    const mergeRequestIid = this.configService.get<string>('app.mergeRequestIid');
    const mergeRequestProjectUrl = this.configService.get<string>('app.mergeRequestProjectUrl');
    const mergeRequestUrl = `${mergeRequestProjectUrl}/-/merge_requests/${mergeRequestIid}`;

    const commitAuthor = this.configService.get<string>('app.commitAuthor');
    const { name: commitAuthorName, email: commitAuthorEmail } = this.parseCommitAuthor(commitAuthor);

    const body: IGitlabWebhookMergeRequestEvent['body'] = {
      user: {
        name: commitAuthorName,
      },
      project: {
        id: this.configService.get<string>('app.projectId'),
      },
      object_attributes: {
        created_at: this.configService.get<string>('app.mergeRequestCreatedAt'),
        id: this.configService.get<string>('app.mergeRequestId'),
        iid: this.configService.get<string>('app.mergeRequestIid'),
        source_branch: this.configService.get<string>('app.mergeRequestSourceBranch'),
        target_branch: this.configService.get<string>('app.mergeRequestTargetBranch'),
        title: this.configService.get<string>('app.mergeRequestTitle'),
        updated_at: this.configService.get<string>('app.mergeRequestUpdatedAt'),
        last_commit: {
          id: this.configService.get<string>('app.commit'),
          message: this.configService.get<string>('app.commitMessage'),
          title: this.configService.get<string>('app.commitTitle'),
          timestamp: this.configService.get<string>('app.commitTimestamp'),
          author: {
            name: commitAuthorName,
            email: commitAuthorEmail,
          },
        },
        state: this.configService.get<string>('app.mergeRequestState'),
        url: mergeRequestUrl,
        // TODO: get actual "action" value. Can be calculated based on merge request state
        action: 'update',
      },
    };

    return { body, headers };
  }

  private parseCommitAuthor(commitAuthor: string) {
    // Example: "John Doe <johndoe@mail.com>"
    const COMMIT_AUTHOR_FORMAT = /(.*) <(.*)>/;
    const match = commitAuthor.match(COMMIT_AUTHOR_FORMAT);
    return {
      name: match[1].trim(),
      email: match[2].trim(),
    };
  }
}
