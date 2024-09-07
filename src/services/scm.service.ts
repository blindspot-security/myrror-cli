import { Injectable } from '@nestjs/common';
import { GitlabService } from './gitlab.service';
import { EScmType, IScmService } from '../types';

@Injectable()
export class ScmService {
  constructor(private readonly gitlabService: GitlabService) {}

  getScmHandler(provider: EScmType): IScmService {
    switch (provider) {
      case EScmType.GITLAB:
        return this.gitlabService;
      default:
        throw new Error(`No scm handler found for provider: ${provider}`);
    }
  }
}
