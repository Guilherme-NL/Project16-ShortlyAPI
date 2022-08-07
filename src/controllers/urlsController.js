import { connection } from "../dbStrategy/postgres.js";
import joi from "joi";
import { nanoid } from "nanoid";

export async function shorten(req, res) {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");
  console.log(token);

  const { rows: sessions } = await connection.query(
    "SELECT * FROM sessions WHERE token = $1",
    [token]
  );

  if (!req.headers || sessions.length < 1) {
    res.sendStatus(401);
    return;
  }

  const { url } = req.body;

  //url validation
  const urlSchema = joi.object({
    url: joi.string().required(),
  });

  const { error } = urlSchema.validate(req.body);

  if (error) {
    res.sendStatus(422);
    return;
  }

  try {
    const shortUrl = nanoid(8);
    const body = {
      shortUrl,
    };

    await connection.query(
      'INSERT INTO urls ("userId", url, "shortUrl") VALUES ($1, $2, $3)',
      [sessions[0].userId, url, shortUrl]
    );

    res.send(body).status(201);
  } catch {
    res.sendStatus(400);
  }
}

export async function getShort(req, res) {
  const id = req.params.id;

  try {
    const { rows: body } = await connection.query(
      'SELECT id, url, "shortUrl" FROM urls WHERE urls.id = $1',
      [id]
    );

    if (body.length < 1) {
      res.sendStatus(404);
      return;
    }

    res.status(200).send(body);
  } catch {
    res.sendStatus(400);
  }
}

export async function getShortOpen(req, res) {
  const shortUrl = req.params.shortUrl;

  const { rows: short } = await connection.query(
    'SELECT * FROM urls WHERE "shortUrl" = $1',
    [shortUrl]
  );

  if (short.length < 1) {
    res.sendStatus(404);
    return;
  }

  const newVisitCount = short[0].visitCount + 1;
  console.log(newVisitCount);
  await connection.query(
    'UPDATE urls SET "visitCount" = $1 WHERE "shortUrl" = $2',
    [newVisitCount, shortUrl]
  );

  res.redirect(short[0].url);
}

export async function deleteShort(req, res) {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");
  const id = req.params.id;

  const { rows: sessions } = await connection.query(
    "SELECT * FROM sessions WHERE token = $1",
    [token]
  );

  const { rows: short } = await connection.query(
    "SELECT * FROM urls WHERE id = $1",
    [id]
  );

  if (short.length < 1) {
    res.sendStatus(404);
    return;
  }

  if (
    !req.headers ||
    sessions.length < 1 ||
    short[0].userId !== sessions[0].userId
  ) {
    res.sendStatus(401);
    return;
  }

  try {
    await connection.query("DELETE FROM urls WHERE id = $1", [id]);
    res.sendStatus(204);
  } catch {
    res.sendStatus(400);
  }
}
