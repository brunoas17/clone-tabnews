import database from "infra/database.js";
import { InternalServerError } from "infra/errors";

export default async function status(request, response) {
  try {
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
  } catch (error) {
    const publicErrorObject = new InternalServerError({
      cause: error,
    });

    console.log(publicErrorObject);
    response.status(500).json(publicErrorObject);
  }
}
