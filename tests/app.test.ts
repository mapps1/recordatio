import request from 'supertest';
import { app } from '../src/app';

describe('Recordatio App', () => {
  test('should initialize without errors', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('should reject invalid check-in scores', async () => {
    const res = await request(app).post('/api/checkins').send({
      mood: 8,
      stress: 12,
      sleepHours: 7,
      energy: 7,
      motivation: 7,
      socialConnection: 6,
      academicPressure: 7,
      biggestStressor: 'Exam week',
    });

    expect(res.status).toBe(400);
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  test('should reject missing biggest stressor', async () => {
    const res = await request(app).post('/api/checkins').send({
      mood: 8,
      stress: 6,
      sleepHours: 7,
      energy: 7,
      motivation: 7,
      socialConnection: 6,
      academicPressure: 7,
      biggestStressor: '',
    });

    expect(res.status).toBe(400);
    expect(res.body.errors).toContain('biggestStressor is required');
  });

  test('should accept and return a valid check-in', async () => {
    const createRes = await request(app).post('/api/checkins').send({
      mood: 8,
      stress: 5,
      sleepHours: 7.5,
      energy: 7,
      motivation: 8,
      socialConnection: 7,
      academicPressure: 6,
      physicalActivity: 20,
      biggestStressor: 'Presentation',
    });

    expect(createRes.status).toBe(201);
    expect(createRes.body.entry).toBeDefined();

    const listRes = await request(app).get('/api/checkins');
    expect(listRes.status).toBe(200);
    expect(listRes.body.entries.length).toBeGreaterThan(0);
  });

  test('should provide dashboard payload', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.profile).toBeDefined();
    expect(res.body.wellnessScore).toBeDefined();
    expect(Array.isArray(res.body.insights)).toBe(true);
  });

  test('should delete an existing check-in', async () => {
    const createRes = await request(app).post('/api/checkins').send({
      mood: 7,
      stress: 4,
      sleepHours: 8,
      energy: 7,
      motivation: 7,
      socialConnection: 7,
      academicPressure: 5,
      biggestStressor: 'None major',
    });

    const id = createRes.body.entry.id;
    const deleteRes = await request(app).delete(`/api/checkins/${id}`);
    expect(deleteRes.status).toBe(204);

    const listRes = await request(app).get('/api/checkins');
    expect(listRes.body.entries.some((entry: { id: string }) => entry.id === id)).toBe(false);
  });
});
