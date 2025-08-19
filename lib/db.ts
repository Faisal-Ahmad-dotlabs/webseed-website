import { Pool } from "pg"

console.log("Attempting to initialize PostgreSQL pool...")

// Ensure environment variables are defined
if (
  !process.env.POSTGRESQL_HOST ||
  !process.env.POSTGRESQL_USER ||
  !process.env.POSTGRESQL_DB ||
  !process.env.POSTGRESQL_PWD ||
  !process.env.POSTGRESQL_PORT
) {
  console.error("❌ Missing one or more PostgreSQL environment variables!")
  console.error("Host:", process.env.POSTGRESQL_HOST ? "Set" : "Missing")
  console.error("User:", process.env.POSTGRESQL_USER ? "Set" : "Missing")
  console.error("DB:", process.env.POSTGRESQL_DB ? "Set" : "Missing")
  console.error("Password:", process.env.POSTGRESQL_PWD ? "Set" : "Missing")
  console.error("Port:", process.env.POSTGRESQL_PORT ? "Set" : "Missing")
  throw new Error("Missing PostgreSQL environment variables")
}

let pool: Pool | undefined // Declare pool as possibly undefined initially

try {
  pool = new Pool({
    host: process.env.POSTGRESQL_HOST,
    port: Number.parseInt(process.env.POSTGRESQL_PORT || "5432"),
    database: process.env.POSTGRESQL_DB,
    user: process.env.POSTGRESQL_USER,
    password: process.env.POSTGRESQL_PWD,
    ssl: {
      rejectUnauthorized: false, // Important for many cloud databases like RDS
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    statement_timeout: 30000,
    query_timeout: 30000,
  })
  console.log("✅ PostgreSQL pool instance created.")

  // Set search path for all connections to match your schema structure
  pool.on("connect", async (client) => {
    try {
      // Adjust this search path to match your actual schema names
      await client.query("SET search_path TO ssot, web_application, public")
      console.log("✅ Connected to PostgreSQL database with schema path: ssot, web_application, public")
    } catch (error) {
      console.error("❌ Error setting search path on connection:", error)
    }
  })

  pool.on("error", (err) => {
    console.error("❌ Unexpected error on idle client in pool:", err)
  })
} catch (error) {
  console.error("❌ Error creating PostgreSQL pool instance:", error)
  // Re-throw or handle the error to prevent `pool` from being undefined
  throw error
}

// Ensure pool is not undefined before exporting
if (!pool) {
  throw new Error("PostgreSQL pool failed to initialize.")
}

export default pool
