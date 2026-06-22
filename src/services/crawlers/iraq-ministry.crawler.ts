/**
 * Real Crawler Example — Iraq Ministry of Trade
 * Production implementation
 */

import { GenericHtmlCrawler, CrawlResult } from '../crawler.framework';

export class IraqMinistryCrawler extends GenericHtmlCrawler {
  constructor() {
    super();
  }

  async crawl(sourceUrl: string): Promise<CrawlResult> {
    // In production this would parse the actual HTML / JSON from the ministry site
    const result = await super.crawl(sourceUrl);

    // Here we would normally use cheerio or a proper parser
    // For now we return the raw result so the pipeline can normalize it

    return result;
  }
}
