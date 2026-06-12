import { Router } from 'express';
import { recordatioService } from '../../services';

export const alertsFeature = Router();

alertsFeature.get('/', (_req, res) => {
  res.json({ alert: recordatioService.getBurnoutAlert() });
});
