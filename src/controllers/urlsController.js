import { connection } from "../dbStrategy/postgres.js";
import joi from "joi";
import { nanoid } from "nanoid";

export async function shorten(req, res) {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");

  const { rows: sessions } = await connection.query(
    "SELECT * FROM sessions WHERE token = $1",
    [token]
  );

  if (!req.headers || sessions.length < 1) {
    res.sendStatus(401);
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
