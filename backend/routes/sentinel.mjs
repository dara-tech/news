import express from 'express';
import sentinelService from '../services/sentinelService.mjs';

const router = express.Router();

// Get real-time logs from Sentinel
router.get('/logs', async (req, res) => {
  try {
    const logs = sentinelService.getLogs();
    res.json({ success: true, logs });
  } catch (error) {
    console.error('Error fetching Sentinel logs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch logs' });
  }
});

// Get Sentinel metrics
router.get('/metrics', async (req, res) => {
  try {
    const metrics = sentinelService.getMetrics();
    res.json({ success: true, metrics });
  } catch (error) {
    console.error('Error fetching Sentinel metrics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch metrics' });
  }
});

export default router;
