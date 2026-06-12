import { Router } from 'express';
import { checkinsFeature } from '../features/checkins';
import { journalingFeature } from '../features/journaling';
import { resourcesFeature } from '../features/resources';
import { alertsFeature } from '../features/alerts';
import { landingPage } from '../pages';
import { recordatioService } from '../services';

export const apiRoutes = Router();

apiRoutes.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

apiRoutes.get('/', landingPage);
apiRoutes.get('/dashboard', (_req, res) => {
  res.json(recordatioService.getDashboardData());
});

apiRoutes.get('/profile', (_req, res) => {
  res.json({ profile: recordatioService.getProfile() });
});

apiRoutes.get('/goals', (_req, res) => {
  res.json({ goals: recordatioService.getGoals() });
});

apiRoutes.get('/achievements', (_req, res) => {
  res.json({ achievements: recordatioService.getAchievements() });
});

apiRoutes.get('/events', (_req, res) => {
  res.json({ events: recordatioService.getEvents() });
});

apiRoutes.get('/notifications', (_req, res) => {
  res.json({ notifications: recordatioService.getNotifications() });
});

apiRoutes.get('/reports/weekly', (_req, res) => {
  res.json({ weeklyReport: recordatioService.getWeeklyReport() });
});

apiRoutes.get('/community', (_req, res) => {
  res.json({ community: recordatioService.getCommunityStats() });
});

apiRoutes.get('/prediction', (_req, res) => {
  res.json(recordatioService.getPrediction());
});

apiRoutes.post('/auth/:mode', (req, res) => {
  res.json({
    mode: req.params.mode,
    message: `Auth flow ready for ${req.params.mode}.`,
  });
});

apiRoutes.use('/checkins', checkinsFeature);
apiRoutes.use('/journaling', journalingFeature);
apiRoutes.use('/resources', resourcesFeature);
apiRoutes.use('/alerts', alertsFeature);
