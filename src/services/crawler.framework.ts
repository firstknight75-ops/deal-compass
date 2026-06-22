/**
 * Production Crawler Framework (Trade Radar - Phase 2)
 * 
 * This is the real crawler abstraction.
 * Future: Add Playwright, proxies, rate limiting, CAPTCHA handling.
 */

import { BaseService } from './base.service';

export interface CrawlResult {
  sourceUrl: string;
  content: string;
  fetchedAt: string;
  status: number;
}

export interface CrawlerOptions {
  timeoutMs?: number;
  maxRetries?: number;
  userAgent?: string;
}

export abstract class BaseCrawler extends BaseService {
  protected options: CrawlerOptions;

  constructor(name: string, options: CrawlerOptions = {}) {
    super(name);
    this.options = {
      timeoutMs: 15000,
      maxRetries: 3,
      userAgent: 'DealCompass-AI/1.0 (+https://dealcompass.ai/bot)',
      ...options,
    };
  }

  abstract crawl(sourceUrl: string): Promise<CrawlResult>;

  protected async fetchWithRetry(url: string, retries = this.options.maxRetries!): Promise<Response> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.options.timeoutMs);

        const res = await fetch(url, {
          headers: { 'User-Agent': this.options.userAgent! },
          signal: controller.signal,
        });

        clearTimeout(timeout);
        return res;
      } catch (err) {
        if (attempt === retries) throw err;
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
    throw new Error('Max retries exceeded');
  }
}

// Concrete example crawler (Government / Directory style)
export class GenericHtmlCrawler extends BaseCrawler {
  constructor() {
    super('GenericHtmlCrawler');
  }

  async crawl(sourceUrl: string): Promise<CrawlResult> {
    const res = await this.fetchWithRetry(sourceUrl);
    const content = await res.text();

    return {
      sourceUrl,
      content: content.slice(0, 250000), // safety cap
      fetchedAt: new Date().toISOString(),
      status: res.status,
    };
  }
}
