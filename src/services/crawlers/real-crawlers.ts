/**
 * Production Crawlers
 * These are real implementations that can be extended.
 */

import { GenericHtmlCrawler } from '../crawler.framework';

export class IraqTradeCrawler extends GenericHtmlCrawler {
  async crawl(sourceUrl: string) {
    // Real fetch happens here
    const result = await super.crawl(sourceUrl);

    // TODO: Add real HTML parsing with cheerio or similar
    // For now we pass raw content to normalization pipeline

    return result;
  }
}

export class TurkeyExportersCrawler extends GenericHtmlCrawler {
  async crawl(sourceUrl: string) {
    return super.crawl(sourceUrl);
  }
}

export class DubaiCommoditiesCrawler extends GenericHtmlCrawler {
  async crawl(sourceUrl: string) {
    return super.crawl(sourceUrl);
  }
}
