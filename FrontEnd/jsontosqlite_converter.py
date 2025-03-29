import json
import sqlite3

def create_database(db_name="recycling.db"):
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS recycling_points (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lat REAL,
            lon REAL,
            type TEXT
        )
    ''')
    conn.commit()
    conn.close()

def insert_data(json_file, db_name="recycling.db"):
    with open(json_file, "r", encoding="utf-8") as file:
        data = json.load(file)
    
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    
    for entry in data:
        cursor.execute('''
            INSERT INTO recycling_points (lat, lon, type)
            VALUES (?, ?, ?)
        ''', (entry["lat"], entry["lon"], entry["type"]))
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    json_file = "data.json"  # Podmień na ścieżkę do pliku JSON
    create_database()
    insert_data(json_file)
    print("Dane zostały zapisane do bazy danych SQLite.")