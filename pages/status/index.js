import useSWR from "swr";

async function fetchApi(key) {
  const response = await fetch(key);
  return await response.json();
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <StatusData />
    </>
  );
}

function StatusData() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchApi, {
    refreshInterval: 2000,
  });

  const loadingText = "Carregando...";

  const updatedAtText =
    isLoading || !data
      ? loadingText
      : new Date(data.updated_at).toLocaleString("pt-BR");

  const database =
    isLoading || !data
      ? {
          version: loadingText,
          max_connections: loadingText,
          opened_connections: loadingText,
        }
      : data.dependencies.database;

  return (
    <ul>
      <li>Última atualização: {updatedAtText}</li>
      <li>
        Dependencias:
        <ul>
          <li>
            Database:
            <ul>
              <li>Versão: {database.version}</li>
              <li>Conexões máximas: {database.max_connections}</li>
              <li>Conexões abertas: {database.opened_connections}</li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  );
}
