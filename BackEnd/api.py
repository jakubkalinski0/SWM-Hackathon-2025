import sqlite3

from fastapi import FastAPI, HTTPException
from fetch_waste_bins import fetch_waste_bins
from closest_bin import closest_bin

DB_FILE = "waste.db"
app = FastAPI()

@app.get("/bins/{product_id}")
def get_bins(product_id: int):
    bins = fetch_waste_bins()
    return {"product_id": product_id, "bins": bins}

@app.get("/closest_bin")
def get_closest_bin(x: float, y: float, type_: str = None):
    closest = closest_bin(x, y, type_)
    return {"closest_bin": closest}


@app.get("/product/{barcode}")
def get_product(barcode: str):
    """ Pobiera produkt po kodzie kreskowym lub tworzy nowy wpis """
    product = get_or_create_product(barcode)
    if not product:
        raise HTTPException(status_code=500, detail="Error creating product")

    return product


def get_or_create_product(barcode: str):
    """ Pobiera produkt z bazy lub tworzy nowy wpis """
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # Sprawdzenie, czy produkt już istnieje
    cursor.execute('''
    SELECT id, name, type_recycle_id, type_id, barcode, green_score, carbon_footprint, number_of_verifications
    FROM Product WHERE barcode = ?
    ''', (barcode,))

    result = cursor.fetchone()

    if result:
        conn.close()
        return {
            "id": result[0],
            "name": result[1],
            "type_recycle_id": result[2],
            "type_id": result[3],
            "barcode": result[4],
            "green_score": result[5],
            "carbon_footprint": result[6],
            "number_of_verifications": result[7]
        }

    # Jeśli produkt nie istnieje – tworzymy nowy wpis
    cursor.execute('''
    INSERT INTO Product (name, type_recycle_id, type_id, barcode, green_score, carbon_footprint, number_of_verifications)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', ("Unknown Product", None, None, barcode, None, None, 0))

    conn.commit()

    # Pobranie nowego produktu
    new_id = cursor.lastrowid
    cursor.execute('SELECT * FROM Product WHERE id = ?', (new_id,))
    new_product = cursor.fetchone()
    conn.close()

    return {
        "id": new_product[0],
        "name": new_product[1],
        "type_recycle_id": new_product[2],
        "type_id": new_product[3],
        "barcode": new_product[4],
        "green_score": new_product[5],
        "carbon_footprint": new_product[6],
        "number_of_verifications": new_product[7]
    }


def get_waste_type(product_id: int):
    """ Pobiera typ odpadów dla danego produktu """
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    cursor.execute('''
    SELECT T.type_name FROM Product P
    JOIN Types T ON P.type_id = T.type_id
    WHERE P.id = ?
    ''', (product_id,))

    result = cursor.fetchone()
    conn.close()

    return {"type": result[0]} if result else None


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)