import { Jwt } from "jsonwebtoken";
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

let dbPromise: Promise<any>;

export async function getDb() {
  if (!dbPromise) {
    dbPromise = open({
      filename: 'mydb.sqlite',
      driver: sqlite3.Database
    });
  }
  return dbPromise;
}

interface credenzialiBody{
    id:string,
    username:string,
    email:string,
    password:string,
    sito:string
}


