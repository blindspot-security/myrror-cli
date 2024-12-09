import { ConsoleLogger } from '@nestjs/common';
import { LogLevel } from '@nestjs/common/services/logger.service';

/**
 * A custom logger that disables all logs emitted by calling `log` method if
 * they use one of the following contexts:
 * - `InstanceLoader`
 * - `RoutesResolver`
 * - `RouterExplorer`
 * - `NestFactory`
 */
export class InternalDisabledLogger extends ConsoleLogger {
  static contextsToIgnore = ['InstanceLoader', 'RoutesResolver', 'RouterExplorer', 'NestFactory'];

  constructor() {
    super();
    const baseLogLevels: LogLevel[] = ['log', 'error', 'warn', 'verbose', 'fatal'];
    if (process.env.MYRROR_LOG_LEVEL === 'debug') {
      baseLogLevels.push('debug');
    }
    this.setLogLevels(baseLogLevels);
  }

  log(message: any, context?: string): void {
    if (!this.isLevelEnabled('log')) {
      return;
    }
    if (!InternalDisabledLogger.contextsToIgnore.includes(context)) {
      if (!context) {
        super.log(message);
      } else {
        super.log(message, context);
      }
    }
  }

  error(message: any, stack?: string, context?: string): void {
    if (!this.isLevelEnabled('error')) {
      return;
    }
    if (!InternalDisabledLogger.contextsToIgnore.includes(context)) {
      if (!stack) {
        super.error(message, stack);
      } else {
        super.error(message, stack, context);
      }
    }
  }

  warn(message: any, context?: string): void {
    if (!this.isLevelEnabled('warn')) {
      return;
    }
    if (!InternalDisabledLogger.contextsToIgnore.includes(context)) {
      if (!context) {
        super.warn(message);
      } else {
        super.warn(message, context);
      }
    }
  }

  debug(message: any, context?: string): void {
    if (!this.isLevelEnabled('debug')) {
      return;
    }
    if (!InternalDisabledLogger.contextsToIgnore.includes(context)) {
      if (!context) {
        super.debug(message);
      } else {
        super.debug(message, context);
      }
    }
  }

  verbose(message: any, context?: string): void {
    if (!this.isLevelEnabled('verbose')) {
      return;
    }
    if (!InternalDisabledLogger.contextsToIgnore.includes(context)) {
      if (!context) {
        super.verbose(message);
      } else {
        super.verbose(message, context);
      }
    }
  }

  formatPid(pid: number): string {
    return `[myrror-cli] ${pid}  - `;
  }
}
