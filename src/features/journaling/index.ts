import { Router } from 'express';
import { recordatioService } from '../../services';

export const journalingFeature = Router();

journalingFeature.get('/', (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const entries = recordatioService.getJournalEntries(search);
  res.json({
    entries,
    prompts: recordatioService.getJournalPrompts(),
    reflectionSummary: entries.length > 0 ? `You have ${entries.length} journal entries.` : 'No journal entries yet.',
  });
});

journalingFeature.post('/', (req, res) => {
  const { title, content } = req.body as { title?: string; content?: string };
  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required' });
    return;
  }
  const entry = recordatioService.createJournalEntry(title, content);
  res.status(201).json({ entry });
});

journalingFeature.put('/:id', (req, res) => {
  const { title, content } = req.body as { title?: string; content?: string };
  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required' });
    return;
  }
  const updated = recordatioService.updateJournalEntry(req.params.id, title, content);
  if (!updated) {
    res.status(404).json({ error: 'Journal entry not found' });
    return;
  }
  res.json({ entry: updated });
});

journalingFeature.delete('/:id', (req, res) => {
  const deleted = recordatioService.deleteJournalEntry(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Journal entry not found' });
    return;
  }
  res.status(204).send();
});
