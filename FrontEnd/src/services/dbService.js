// dbService.ts
import SQLite from 'sql.js';

let SQL: any = null;
let db: SQLite.Database | null = null;

// Function to initialize SQL.js and open the database
export const openDatabase = async (): Promise<SQLite.Database> => {
  if (db) return db;
  
  try {
    if (!SQL) {
      // Initialize SQL.js
      SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
      });
    }
    
    // Fetch the database file
    const response = await fetch('/recycling.db');
    const arrayBuffer = await response.arrayBuffer();
    
    // Open the database
    db = new SQL.Database(new Uint8Array(arrayBuffer));
    return db;
  } catch (error) {
    console.error('Error opening database:', error);
    throw new Error('Failed to open database');
  }
};

export const getAllRecyclingPoints = async (db: SQLite.Database) => {
  try {
    const result = db.exec('SELECT id, type, lat, lon, address FROM recycling_points');
    
    if (result.length === 0) {
      return [];
    }
    
    const columns = result[0].columns;
    const values = result[0].values;
    
    return values.map(row => {
      const id = row[columns.indexOf('id')];
      const type = row[columns.indexOf('type')];
      const lat = row[columns.indexOf('lat')];
      const lon = row[columns.indexOf('lon')];
      const address = row[columns.indexOf('address')];
      
      return {
        id,
        type,
        location: { lat, lng: lon },
        acceptedWaste: [type],
        address
      };
    });
  } catch (error) {
    console.error('Error fetching recycling points:', error);
    throw new Error('Failed to fetch recycling points from database');
  }
};

// Helper function to initialize SQL.js
async function initSqlJs(config: any) {
  return new Promise((resolve, reject) => {
    // Add the SQL.js script to the page
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js';
    script.onload = () => {
      // @ts-ignore
      initSqlJs(config).then(resolve).catch(reject);
    };
    script.onerror = () => {
      reject(new Error('Failed to load SQL.js'));
    };
    document.head.appendChild(script);
  });
}