import { createRouter } from "next-connect";
import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database.js";
import controller from "infra/controller";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

const defaultMigrationsOptions = {
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
};

async function getHandler(request, response) {
  const dbClient = await database.getNewClient();

  const pendingMigrations = await migrationRunner({
    ...defaultMigrationsOptions,
    dbClient: dbClient,
  });

  await dbClient.end();

  return response.status(200).json(pendingMigrations);
}

async function postHandler(request, response) {
  const dbClient = await database.getNewClient();

  const migratedMigrations = await migrationRunner({
    ...defaultMigrationsOptions,
    dbClient: dbClient,
    dryRun: false,
  });

  await dbClient.end();

  if (migratedMigrations.length > 0) {
    return response.status(201).json(migratedMigrations);
  }

  return response.status(200).json(migratedMigrations);
}
