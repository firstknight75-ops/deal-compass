/**
 * REAL Production HTTP Crawlers
 * These actually fetch live data from public sources.
 */

import { BaseCrawler, CrawlResult } from '../crawler.framework';

export class RealHttpCrawler extends BaseCrawler {
  async crawl(sourceUrl: string): Promise<CrawlResult> {
    this.log('info', `Real fetch: ${sourceUrl}`);

    const res = await this.fetchWithRetry(sourceUrl);
    const text = await res.text();

    return {
      sourceUrl,
      content: text.substring(0, 300000),
      fetchedAt: new Date().toISOString(),
      status: res.status,
    };
  }
}

// Specific source crawlers
export class IraqMinistryCrawler extends RealHttpCrawler {
  async crawl(url: string) {
    this.log('info', 'Crawling Iraq government tenders');
    return super.crawl(url);
  }
}

export class TurkeyExportersCrawler extends RealHttpCrawler {}
export class DubaiCommoditiesCrawler extends RealHttpCrawler {}
export class IranTradeCrawler extends RealHttpCrawler {}
