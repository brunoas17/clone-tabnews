import { Client } from "pg";

async function query(queryObject) {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
  });
  await client.connect();

  let result = null;
  try {
    result = await client.query(queryObject);
  } catch (err) {
    console.log(err);
  } finally {
    await client.end();
  }

  return result;
}

export default {
  query: query,
};
