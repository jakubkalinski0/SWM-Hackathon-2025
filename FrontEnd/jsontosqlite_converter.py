import json
import sqlite3
from pathlib import Path

def create_database(json_path: str, db_path: str = 'bins_database.sqlite'):
    """
    Konwertuje plik JSON na bazę SQLite z dowolnymi typami pojemników
    """
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Błąd podczas wczytywania pliku JSON: {e}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Tabela bez ograniczeń CHECK dla bin_type
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS bins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        bin_type TEXT NOT NULL
    )
    ''')

    # Wstawianie danych
    inserted_rows = 0
    errors = 0
    
    for idx, entry in enumerate(data, 1):
        try:
            if len(entry) == 3:
                lat, lon, bin_type = entry
                cursor.execute(
                    'INSERT INTO bins (latitude, longitude, bin_type) VALUES (?, ?, ?)',
                    (float(lat), float(lon), str(bin_type))
                )
                inserted_rows += 1
            else:
                print(f"Nieprawidłowy format wpisu #{idx}: {entry}")
                errors += 1
        except Exception as e:
            print(f"Błąd przy wpisie #{idx} {entry}: {e}")
            errors += 1

    conn.commit()
    conn.close()

    print(f"\nPodsumowanie:")
    print(f"- Zaimportowane rekordy: {inserted_rows}")
    print(f"- Błędy: {errors}")
    print(f"- Utworzono bazę danych: {db_path}")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser()
    parser.add_argument('json_file', help='Ścieżka do pliku JSON z danymi')
    parser.add_argument('--db', help='Ścieżka do pliku bazy SQLite (domyślnie: bins_database.sqlite)')
    
    args = parser.parse_args()
    
    create_database(
        json_path=args.json_file,
        db_path=args.db if args.db else 'bins_database.sqlite'
    )