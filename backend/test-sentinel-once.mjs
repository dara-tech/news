import 'dotenv/config';
import connectDB from './config/db.mjs';
import sentinelService from './services/sentinelService.mjs';
import News from './models/News.mjs';
import logger from '../utils/logger.mjs';

(async () => {
  try {
    await connectDB();
    const start = new Date();
    logger.info('[Test] Running Sentinel once (persist)...');
    const result = await sentinelService.runOnce({ persistOverride: true });
    logger.info('[Test] Result:', result);

    // Wait briefly for DB writes to settle
    await new Promise(r => setTimeout(r, 1000));

    const recent = await News.find({ createdAt: { $gte: start } })
      .sort({ createdAt: -1 })
      .limit(10)
      .select({ 'title.en': 1, 'title.kh': 1, thumbnail: 1, 'source.name': 1, 'source.url': 1, 'ingestion.method': 1, createdAt: 1 })
      .lean();

    logger.info('[Test] Recently created drafts:');
    for (const doc of recent) {
      logger.info({
        title_en: doc?.title?.en,
        title_kh: doc?.title?.kh,
        thumbnail: doc?.thumbnail,
        source: doc?.source?.name,
        url: doc?.source?.url,
        ingestion: doc?.ingestion?.method,
        createdAt: doc?.createdAt,
      });
    }

    process.exit(0);
  } catch (e) {
    logger.error('[Test] Error:', e);
    process.exit(1);
  }
})();
