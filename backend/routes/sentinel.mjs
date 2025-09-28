import express from 'express';
import sentinelService from '../services/sentinelService.mjs';
import logger from '../utils/logger.mjs';

const router = express.Router();

// Get real-time logs from Sentinel
router.get('/logs', async (req, res) => {
  try {
    const logs = sentinelService.getLogs();
    res.json({ success: true, logs });
  } catch (error) {
    logger.error('Error fetching Sentinel logs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch logs' });
  }
});

// Get Sentinel metrics
router.get('/metrics', async (req, res) => {
  try {
    const metrics = sentinelService.getMetrics();
    res.json({ success: true, metrics });
  } catch (error) {
    logger.error('Error fetching Sentinel metrics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch metrics' });
  }
});

// Reload Sentinel sources
router.post('/reload-sources', async (req, res) => {
  try {
    await sentinelService.loadSources();
    res.json({ success: true, message: 'Sources reloaded successfully' });
  } catch (error) {
    logger.error('Error reloading Sentinel sources:', error);
    res.status(500).json({ success: false, error: 'Failed to reload sources' });
  }
});

// Run Sentinel once
router.post('/run-once', async (req, res) => {
  try {
    const result = await sentinelService.runOnce();
    res.json({ success: true, result });
  } catch (error) {
    logger.error('Error running Sentinel once:', error);
    res.status(500).json({ success: false, error: 'Failed to run Sentinel' });
  }
});

export default router;
