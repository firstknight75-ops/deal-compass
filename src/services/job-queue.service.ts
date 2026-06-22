/**
 * Strengthened Job Queue Service (in-memory with better features + ready for real backend)
 */
import { logger } from '../lib/logger';

interface Job {
  id: string;
  name: string;
  payload: any;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  attempts: number;
  lastError?: string;
}

export class JobQueueService {
  private jobs = new Map<string, Job>();
  private processors = new Map<string, (payload: any) => Promise<any>>();

  async enqueue(name: string, payload: any = {}): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const job: Job = {
      id: jobId,
      name,
      payload,
      status: 'queued',
      createdAt: new Date(),
      attempts: 0,
    };
    this.jobs.set(jobId, job);
    logger.info(`Job enqueued: ${name}`, { jobId });
    return jobId;
  }

  registerProcessor(name: string, fn: (payload: any) => Promise<any>) {
    this.processors.set(name, fn);
  }

  async processNext(): Promise<boolean> {
    const queued = Array.from(this.jobs.values()).find(j => j.status === 'queued');
    if (!queued) return false;

    queued.status = 'processing';
    queued.attempts++;

    try {
      const processor = this.processors.get(queued.name);
      if (processor) {
        await processor(queued.payload);
      }
      queued.status = 'completed';
      logger.info(`Job completed: ${queued.name}`, { jobId: queued.id });
      return true;
    } catch (err: any) {
      queued.status = 'failed';
      queued.lastError = err.message;
      logger.error(`Job failed: ${queued.name}`, { jobId: queued.id, error: err.message });
      return false;
    }
  }

  getStats() {
    const list = Array.from(this.jobs.values());
    return {
      total: list.length,
      queued: list.filter(j => j.status === 'queued').length,
      processing: list.filter(j => j.status === 'processing').length,
      completed: list.filter(j => j.status === 'completed').length,
      failed: list.filter(j => j.status === 'failed').length,
    };
  }
}

export const jobQueueService = new JobQueueService();
