import { Router } from 'express';
import { recordatioService } from '../../services';

export const checkinsFeature = Router();

checkinsFeature.get('/', (_req, res) => {
  const entries = recordatioService.getCheckIns();
  res.json({
    entries,
    trends: recordatioService.getTrendSummary(),
    insights: recordatioService.getInsights(),
    burnoutAlert: recordatioService.getBurnoutAlert(),
  });
});

checkinsFeature.post('/', (req, res) => {
  const errors = recordatioService.validateInput(req.body);
  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  const entry = recordatioService.addCheckIn(req.body);
  res.status(201).json({
    entry,
    trends: recordatioService.getTrendSummary(),
    insights: recordatioService.getInsights(),
    burnoutAlert: recordatioService.getBurnoutAlert(),
  });
});

checkinsFeature.delete('/:id', (req, res) => {
  const deleted = recordatioService.deleteCheckIn(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Check-in not found' });
    return;
  }
  res.status(204).send();
});
