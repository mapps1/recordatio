import { Router } from 'express';
import { recordatioService } from '../../services';

export const resourcesFeature = Router();

resourcesFeature.get('/', (_req, res) => {
  res.json({
    resources: recordatioService.getResources(),
    videos: recordatioService.getVideos(),
  });
});
