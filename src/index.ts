import express from 'express';
import { config } from 'dotenv';
import { getDb } from './db';

config();

const port = process.env.PORT || '3000';
const app = express();


app.use(express.json());

app.use((req, res, next) => {
  console.log('Corpo Grezzo:', req.body);
  next();
});

async function initializeDatabase() {
  const db = await getDb();
  await db.exec(`
   
  `);
}

initializeDatabase();


app.listen(port, () => {
  console.log(`Server in ascolto su http://localhost:${port}`);
});
