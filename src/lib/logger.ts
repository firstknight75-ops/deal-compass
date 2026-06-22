/**
 * Production Structured Logging Service
 * Replaces console.log with structured, level-aware logging.
 * Ready for integration with external log shippers (Datadog, Loki, etc).
 */

import { getConfig } from './config';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  service?: string;
  userId?: string;
  requestId?: string;
  [key: string]: any;
}

class Logger {
  private isProduction: boolean;

  constructor() {
    this.isProduction = getConfig().isProduction;
  }

  private format(level: LogLevel, message: string, context?: LogContext) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context,
      env: getConfig().NODE_ENV,
    };
    return JSON.stringify(entry);
  }

  debug(message: string, context?: LogContext) {
    if (!this.isProduction) {
      console.debug(this.format('debug', message, context));
    }
  }

  info(message: string, context?: LogContext) {
    console.info(this.format('info', message, context));
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.format('warn', message, context));
  }

  error(message: string, context?: LogContext) {
    console.error(this.format('error', message, context));
  }

  // Convenience for services
  logEvent(service: string, event: string, meta?: Record<string, any>) {
    this.info(`[${service}] ${event}`, { service, ...meta });
  }
}

export const logger = new Logger();
