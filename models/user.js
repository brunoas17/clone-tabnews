import database from "infra/database";
import { NotFoundError, ValidationError } from "infra/errors";

async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username);

  return userFound;

  async function runSelectQuery(username) {
    const results = await database.query({
      text: `
        SELECT 
          *
        FROM
          users
        WHERE 
          LOWER(username) = LOWER($1)
        LIMIT 
          1;
      `,
      values: [username],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: `O username informado não foi encontrado no sistema.`,
        action: `Verifique se o username informado está correto e tente novamente.`,
      });
    }

    return results.rows[0];
  }
}

async function create(userInputValues) {
  await validateUnique("email", userInputValues.email);
  await validateUnique("username", userInputValues.username);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function validateUnique(field, value) {
    const results = await database.query({
      text: `
        SELECT ${field} FROM users WHERE LOWER(${field}) = LOWER($1);
      `,
      values: [value],
    });

    if (results.rowCount > 0) {
      throw new ValidationError({
        message: `O ${field} informado já está em uso.`,
        action: `Utilize outro ${field} para criar o usuário.`,
      });
    }
  }

  async function runInsertQuery(userInputValues) {
    const results = await database.query({
      text: `
        INSERT INTO 
          users (username, email, password)
        VALUES 
          ($1, $2, $3)
        RETURNING *;
      `,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });

    return results.rows[0];
  }
}

const user = {
  create,
  findOneByUsername,
};

export default user;
