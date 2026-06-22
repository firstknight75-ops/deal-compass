/**
 * Chamber of Commerce Crawler (Production pattern)
 */

import { GenericHtmlCrawler } from '../crawler.framework';

export class ChamberOfCommerceCrawler extends GenericHtmlCrawler {
  async crawl(sourceUrl: string) {
    this.log('info', `Chamber crawl: ${sourceUrl}`);
    return super.crawl(sourceUrl);
  }
}
