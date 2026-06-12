import { Request, Response } from 'express';

export const landingPage = (_req: Request, res: Response): void => {
  res.send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Recordatio</title>
  <style>
    body { font-family: Segoe UI, Arial, sans-serif; margin: 0; background: #f3f6fb; color: #102347; }
    .wrap { max-width: 860px; margin: 40px auto; background: #fff; border-radius: 14px; padding: 24px; box-shadow: 0 10px 24px rgba(0,0,0,.08); }
    h1 { margin-top: 0; }
    .muted { color: #5f7295; }
    .row { display: grid; gap: 10px; grid-template-columns: repeat(2, minmax(0,1fr)); }
    input, button { padding: 10px; border-radius: 10px; border: 1px solid #ccd7ec; font: inherit; }
    button { cursor: pointer; border: 0; background: #2f6bff; color: #fff; }
    pre { background: #0f1d3b; color: #d8e5ff; padding: 12px; border-radius: 10px; overflow: auto; }
    @media (max-width: 700px) { .row { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main class="wrap">
    <h1>Recordatio</h1>
    <p class="muted">Local project restored. Use this page to quickly post a check-in and inspect dashboard JSON.</p>

    <div class="row">
      <input id="mood" type="number" min="1" max="10" value="7" placeholder="Mood (1-10)" />
      <input id="stress" type="number" min="1" max="10" value="4" placeholder="Stress (1-10)" />
      <input id="sleep" type="number" min="0" max="14" step="0.1" value="7.2" placeholder="Sleep hours" />
      <input id="energy" type="number" min="1" max="10" value="7" placeholder="Energy" />
      <input id="motivation" type="number" min="1" max="10" value="6" placeholder="Motivation" />
      <input id="social" type="number" min="1" max="10" value="7" placeholder="Social connection" />
      <input id="pressure" type="number" min="1" max="10" value="6" placeholder="Academic pressure" />
      <input id="stressor" value="Upcoming exam" placeholder="Biggest stressor" />
    </div>
    <p>
      <button id="save" type="button">Save Check-In</button>
      <button id="dash" type="button">Load Dashboard</button>
    </p>

    <pre id="out">Ready.</pre>
  </main>

  <script>
    const out = document.getElementById('out');
    const num = (id) => Number(document.getElementById(id).value);
    const text = (id) => document.getElementById(id).value;

    async function api(url, options) {
      const r = await fetch(url, options);
      const raw = await r.text();
      const data = raw ? JSON.parse(raw) : {};
      if (!r.ok) throw new Error(data.error || (data.errors && data.errors.join(', ')) || 'Request failed');
      return data;
    }

    document.getElementById('save').addEventListener('click', async () => {
      try {
        const payload = {
          mood: num('mood'),
          stress: num('stress'),
          sleepHours: num('sleep'),
          energy: num('energy'),
          motivation: num('motivation'),
          socialConnection: num('social'),
          academicPressure: num('pressure'),
          biggestStressor: text('stressor'),
          physicalActivity: 20,
        };
        const data = await api('/api/checkins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        out.textContent = JSON.stringify(data, null, 2);
      } catch (e) {
        out.textContent = e.message;
      }
    });

    document.getElementById('dash').addEventListener('click', async () => {
      try {
        const data = await api('/api/dashboard');
        out.textContent = JSON.stringify(data, null, 2);
      } catch (e) {
        out.textContent = e.message;
      }
    });
  </script>
</body>
</html>`);
};
