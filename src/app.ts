import express from 'express';
import cors from 'cors';
import { apiRoutes } from './routes';

export const app = express();

app.use(cors());
app.use(express.json());
app.get('/', (_req, res) => {
  res.redirect('/api');
});
app.use('/api', apiRoutes);

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Recordatio API running on http://localhost:${port}`);
  });
}
