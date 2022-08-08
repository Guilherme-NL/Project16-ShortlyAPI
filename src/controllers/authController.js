import { connection } from "../dbStrategy/postgres.js";
import { v4 as uuid } from "uuid";
import joi from "joi";
import bcrypt from "bcrypt";

export async function signup(req, res) {
  const user = req.body;
  console.log(req.body);

  //Validation joi
  const userSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.required(),
    confirmPassword: joi.required(),
  });

  const { error } = userSchema.validate(user);

  if (error || user.password !== user.confirmPassword) {
    res.sendStatus(422);
    return;
  }

  //Email_validation
  const { rows: checkEmail } = await connection.query(
    "SELECT * FROM users WHERE email = $1",
    [user.email]
  );

  if (checkEmail.length > 0) {
    res.sendStatus(409);
    return;
  }

  const passwordCrypt = bcrypt.hashSync(user.password, 10);

  try {
    await connection.query(
      'INSERT INTO users ("name","email","password") VALUES ($1, $2, $3)',
      [user.name, user.email, passwordCrypt]
    );

    res.sendStatus(201);
  } catch {
    res.sendStatus(400);
  }
}

export async function signin(req, res) {
  const user = req.body;

  //Validation joi
  const userSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  });

  const { error } = userSchema.validate(user);

  if (error) {
    res.sendStatus(422);
    return;
  }

  //user validation
  const { rows: userValidation } = await connection.query(
    "SELECT * FROM users WHERE email = $1",
    [user.email]
  );

  if (userValidation.length < 1) {
    res.sendStatus(401);
    return;
  }

  const comparePassword = bcrypt.compareSync(
    user.password,
    userValidation[0].password
  );

  if (!comparePassword) {
    res.sendStatus(401);
    return;
  }

  try {
    //Token generatioin
    const token = uuid();

    await connection.query(
      'INSERT INTO sessions ("userId","token") VALUES ($1, $2)',
      [userValidation[0].id, token]
    );

    res.sendStatus(200);
  } catch {
    res.sendStatus(400);
  }
}
