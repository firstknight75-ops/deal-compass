/**
 * Production-grade Base Service
 * Every service must extend this or implement the interface.
 */
export interface IBaseService {
  getName(): string;
  healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; details?: any }>;
}

export abstract class BaseService implements IBaseService {
  protected readonly serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  getName(): string {
    return this.serviceName;
  }

  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; details?: any }> {
    // Default implementation - override in subclasses
    return { status: 'healthy' };
  }

  protected log(level: 'info' | 'warn' | 'error', message: string, meta?: Record<string, any>) {
    const timestamp = new Date().toISOString();
    console[level](`[${timestamp}] [${this.serviceName}] ${message}`, meta || '');
  }
}
