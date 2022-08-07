import { connection } from "../dbStrategy/postgres.js";

export async function ranking(req, res) {
  const { rows: body } = await connection.query(`
    SELECT users.id, users.name, COUNT(urls.url) AS "linksCount", SUM(urls."visitCount") AS "visitCount"
    FROM users
    JOIN urls ON users.id = urls."userId"
    GROUP BY users.id
    ORDER BY "visitCount" DESC
    LIMIT 10
    `);
  try {
    res.status(200).send(body);
  } catch {
    res.sendStatus(400);
  }
}
