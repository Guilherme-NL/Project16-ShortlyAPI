import { connection } from "../dbStrategy/postgres.js";

export async function getUsers(req, res) {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");

  const { rows: sessions } = await connection.query(
    "SELECT * FROM sessions WHERE token = $1",
    [token]
  );

  if (!req.headers || sessions.length < 1) {
    res.sendStatus(401);
    return;
  }

  try {
    const { rows: body } = await connection.query(
      `
      SELECT users.id, users.name, SUM(urls."visitCount") AS "visitCount", json_agg(json_build_object('id', urls.id, 'shortUrl', urls."shortUrl", 'url', urls.url, 'visitCount', urls."visitCount")) as "shortenedUrls" 
      FROM users
      INNER JOIN sessions ON sessions."userId" = users.id
      INNER JOIN urls ON urls."userId" = users.id
      WHERE sessions.token = $1
      GROUP BY users.id;
      `,
      [token]
    );
    res.status(200).send(body);
  } catch {
    res.sendStatus(400);
  }
}
