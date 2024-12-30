<script lang="ts">
  import {
    SQLiteDBConnection,
    SQLiteConnection,
    CapacitorSQLite,
  } from "@capacitor-community/sqlite";
  import { Capacitor } from "@capacitor/core";

  export let name: string;
  export let db: SQLiteDBConnection;

  let items: any[] = [];

  // Function to load items
  async function loadItems() {
    try {
      const result = await db.query(`
        SELECT * FROM items 
        ORDER BY created_at DESC
        LIMIT 10
      `);
      items = result.values || [];
    } catch (error) {
      console.error("Error loading items:", error);
    }
  }

  // Load items when component mounts
  loadItems();

  async function handleClick() {
    try {
      // Insert new item
      await db.execute(`
        INSERT INTO items (title) 
        VALUES ('Item ${Date.now()}')
      `);

      // Save the store after insert only for web platform
      if (Capacitor.getPlatform() === "web") {
        const sqlite = new SQLiteConnection(CapacitorSQLite);
        await sqlite.saveToStore("mydb");
      }

      // Reload items to show the new one
      await loadItems();
    } catch (error) {
      console.error("Error inserting item:", error);
    }
  }
</script>

<main>
  <h1>Hello {name}!</h1>

  <!-- Display items -->
  <div class="items-list">
    {#each items as item}
      <div class="item">
        <h3>{item.title}</h3>
        <p>Created: {new Date(item.created_at).toLocaleString()}</p>
      </div>
    {/each}
  </div>

  <button on:click={handleClick}>Add New Item</button>
</main>

<style>
  .items-list {
    margin: 20px 0;
    text-align: left;
  }

  .item {
    border: 1px solid #ddd;
    padding: 10px;
    margin: 10px 0;
    border-radius: 4px;
  }

  .item h3 {
    margin: 0 0 5px 0;
  }

  .item p {
    margin: 0;
    font-size: 0.8em;
    color: #666;
  }
</style>
