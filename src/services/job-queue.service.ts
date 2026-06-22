/**
 * Production Job Queue Service (basic but real)
 * Can be replaced with BullMQ / Temporal later.
 */

import { BaseService } from './base.service';
import { runAllBackgroundJobs } from '../workers/background-jobs';

export class JobQueueService extends BaseService {
  private jobs: Map<string, any> = new Map();

  constructor() {
    super('JobQueueService');
  }

  async enqueue(name: string, payload: any = {}) {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    this.jobs.set(jobId, { name, payload, status: 'queued', createdAt: new Date() });

    this.log('info', `Enqueued job: ${name}`, { jobId });

    // Execute immediately for now (in production this would go to a queue worker)
    if (name === 'full-crawl-cycle' || name === 'background-jobs') {
      setTimeout(async () => {
        try {
          const result = await runAllBackgroundJobs();
          this.jobs.set(jobId, { ...this.jobs.get(jobId), status: 'completed', result });
        } catch (e) {
          this.jobs.set(jobId, { ...this.jobs.get(jobId), status: 'failed', error: e });
        }
      }, 100);
    }

    return { jobId, status: 'queued' };
  }

  async getJob(jobId: string) {
    return this.jobs.get(jobId);
  }
}

export const jobQueue = new JobQueueService();
