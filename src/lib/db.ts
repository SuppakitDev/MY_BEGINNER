import sql from "mssql";

declare global {
  // ป้องกัน pool ซ้ำตอน dev HMR
  // eslint-disable-next-line no-var
  var __mssqlPool__: sql.ConnectionPool | null | undefined;
}

const cfg: sql.config = {
  server: process.env.SQL_SERVER as string,
  database: process.env.SQL_DATABASE as string,
  user: process.env.SQL_USER as string,
  password: process.env.SQL_PASSWORD as string,
  port: Number(process.env.SQL_PORT || 1433),
  options: {
    encrypt: true, // ใช้กับ Azure/ssl
    trustServerCertificate: process.env.SQL_TRUST_CERT === "true",
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

export async function getPool(): Promise<sql.ConnectionPool> {
  if (!global.__mssqlPool__) {
    const pool = new sql.ConnectionPool(cfg);
    global.__mssqlPool__ = await pool.connect();
  }
  return global.__mssqlPool__!;
}
