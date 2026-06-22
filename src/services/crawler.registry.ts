/**
 * Production Crawler Registry
 * Central place to register and run all real crawlers.
 */

import { BaseCrawler } from './crawler.framework';
import { IraqMinistryCrawler } from './crawlers/iraq-ministry.crawler';
import { ChamberOfCommerceCrawler } from './crawlers/chamber.crawler';
import { GovernmentTendersCrawler } from './crawlers/government-tenders.crawler';

export class CrawlerRegistry {
  private crawlers: Record<string, BaseCrawler> = {};

  constructor() {
    this.register('iraq-ministry', new IraqMinistryCrawler());
    this.register('chamber', new ChamberOfCommerceCrawler());
    this.register('government-tenders', new GovernmentTendersCrawler());
  }

  register(name: string, crawler: BaseCrawler) {
    this.crawlers[name] = crawler;
  }

  get(name: string): BaseCrawler | undefined {
    return this.crawlers[name];
  }

  getAll(): BaseCrawler[] {
    return Object.values(this.crawlers);
  }
}

export const crawlerRegistry = new CrawlerRegistry();
