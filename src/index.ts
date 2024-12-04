import express from 'express';
import { config } from 'dotenv';
import { getDb } from './db';
import { routerUser } from './router/RouterUser';
import { routerAuth } from './router/RouterAuth';


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

CREATE TABLE IF NOT EXISTS user (
  id TEXT PRIMARY KEY, 
  idUser TEXT UNIQUE NOT NULL, 
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL 
);

CREATE TABLE IF NOT EXISTS auth (
  id TEXT PRIMARY KEY, 
  idUser TEXT NOT NULL, 
  token TEXT NOT NULL, 
  FOREIGN KEY(idUser) REFERENCES user (idUser) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS credenziali (
  id TEXT PRIMARY KEY,
  idUser TEXT NOT NULL,
  username TEXT NOT NULL, 
  email TEXT NOT NULL,
  password TEXT NOT NULL, 
  service TEXT NOT NULL, 
  FOREIGN KEY(idUser) REFERENCES user (idUser) ON DELETE CASCADE
);


 `);
}

initializeDatabase();

app.use("/user", routerUser);
app.use("/auth",routerAuth);



app.listen(port, () => {
  console.log(`Server in ascolto su http://localhost:${port}`);
});
