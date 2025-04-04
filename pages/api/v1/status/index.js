import { createRouter } from "next-connect";
import database from "infra/database.js";
import { InternalServerError, MethodNotAllowedError } from "infra/errors";

const router = createRouter();

router.get(getHandler);

export default router.handler({
  onNoMatch: onNoMatchHandler,
  onError: onErrorHandler
});

function onNoMatchHandler(request, response) {
  const publicErrorObject = new MethodNotAllowedError();
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onErrorHandler(error, request, response) {
  const publicErrorObject = new InternalServerError({
    cause: error,
  });

  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

async function getHandler(request, response) {

  const updatedAt = new Date().toISOString();

  const databaseServerVersion = await database.query("SHOW server_version;");
  const databaseMaxConnections = await database.query(
    "SHOW max_connections;",
  );

  const databaseName = process.env.POSTGRES_DB;
  const databaseOpenedConnection = await database.query({
    text: `SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;`,
    values: [databaseName],
  });

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: databaseServerVersion.rows[0].server_version,
        max_connections: parseInt(
          databaseMaxConnections.rows[0].max_connections,
        ),
        opened_connections: databaseOpenedConnection.rows[0].count,
      },
    },
  });    
}
