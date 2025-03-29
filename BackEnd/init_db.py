import sqlite3
import json

DB_FILE = "waste.db"
DATA_FILE = "processed_products.json"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # Tworzenie tabel
    cursor.executescript('''
    CREATE TABLE IF NOT EXISTS Types (
        type_id INTEGER PRIMARY KEY AUTOINCREMENT,
        type_name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS Types_recycle (
        type_recycle_id INTEGER PRIMARY KEY AUTOINCREMENT,
        type_name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS Product (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        type_recycle_id INTEGER DEFAULT NULL,
        type_id INTEGER DEFAULT NULL,
        barcode TEXT UNIQUE,
        green_score TEXT DEFAULT NULL,
        carbon_footprint FLOAT DEFAULT NULL,
        number_of_verifications INTEGER DEFAULT 0,
        image_url TEXT DEFAULT NULL,
        FOREIGN KEY (type_recycle_id) REFERENCES Types_recycle(type_recycle_id),
        FOREIGN KEY (type_id) REFERENCES Types(type_id)
    );
    ''')

    # Wczytanie danych z JSON
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        data = json.load(file)

    # Zbiór unikalnych typów i materiałów opakowań
    types_set = set()
    packaging_materials_set = set()

    # Iteracja po liście produktów
    for item in data:
        if item.get("type"):
            types_set.add(item["type"])
        if item.get("packaging_material"):
            packaging_materials_set.add(item["packaging_material"])

    # Dodanie unikalnych typów do tabeli Types
    for type_name in types_set:
        cursor.execute('INSERT OR IGNORE INTO Types (type_name) VALUES (?)', (type_name,))

    # Dodanie unikalnych materiałów opakowań do tabeli Types_recycle
    for material in packaging_materials_set:
        cursor.execute('INSERT OR IGNORE INTO Types_recycle (type_name) VALUES (?)', (material,))

    conn.commit()

    # Pobranie ID typów
    cursor.execute("SELECT type_id, type_name FROM Types")
    types_dict = {row[1]: row[0] for row in cursor.fetchall()}

    cursor.execute("SELECT type_recycle_id, type_name FROM Types_recycle")
    types_recycle_dict = {row[1]: row[0] for row in cursor.fetchall()}

    # Dodanie produktów
    for p in data:
        type_id = types_dict.get(p.get("type"))
        type_recycle_id = types_recycle_dict.get(p.get("packaging_material"))

        cursor.execute('''
        INSERT OR IGNORE INTO Product (name, type_recycle_id, type_id, barcode, green_score, carbon_footprint, number_of_verifications, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (p.get("name"), type_recycle_id, type_id, p.get("barcode"), p.get("green_score"), p.get("carbon_footprint"), 0, p.get("image_url")))

    conn.commit()
    conn.close()

init_db()
