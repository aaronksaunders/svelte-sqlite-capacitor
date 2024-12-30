import { mount } from "svelte";
import "./app.css";
import App from "./App.svelte";
import { Capacitor } from "@capacitor/core";
import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";
import { defineCustomElements as jeepSqlite } from "jeep-sqlite/loader";

async function initializeDB() {
  const platform = Capacitor.getPlatform();
  console.log("platform:", platform);

  const sqlite = new SQLiteConnection(CapacitorSQLite);

  if (platform === "web") {
    await jeepSqlite(window);
    await customElements.whenDefined("jeep-sqlite");
    const jeepSqliteEl = document.createElement("jeep-sqlite");
    document.body.appendChild(jeepSqliteEl);
    await customElements.whenDefined("jeep-sqlite");
    await sqlite.initWebStore();
  }

  const db = await sqlite.createConnection(
    "mydb",
    false,
    "no-encryption",
    1,
    false
  );
  await db.open();

  // Create table if it doesn't exist
  await db.execute(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Save store only for web platform
  if (platform === "web") {
    await sqlite.saveToStore("mydb");
    console.log("Store saved successfully");
  }

  return db;
}

let app = null;
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const db = await initializeDB();
    app = mount(App, {
      target: document.getElementById("app")!,
      props: {
        name: "John Doe",
        db: db,
      },
    });
  } catch (error) {
    console.error("Error initializing app:", error);
  }
});

export default app;
