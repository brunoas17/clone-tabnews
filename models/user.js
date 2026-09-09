import database from "infra/database";
import { ValidationError } from "infra/errors";

async function create(userInputValues) {

  await validateUnique('email', userInputValues.email);
  await validateUnique('username', userInputValues.username);
  
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
    })
  
    return results.rows[0];
  }
}

const user = {
  create
}

export default user;