import sqlite3

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fetch_waste_bins import fetch_waste_bins
from closest_bin import closest_bin

DB_FILE = "waste.db"
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/bins")
def get_bins(lat: int, long: int, category: str):
    bins = fetch_waste_bins(category)
    return bins

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

    cursor.execute('''
    SELECT 
        P.id,
        P.name,
        TR.type_name AS recycle_type,
        T.type_name AS product_type,
        P.barcode,
        P.green_score,
        P.carbon_footprint,
        P.number_of_verifications,
        P.image_url
    FROM Product P
    LEFT JOIN Types T ON P.type_id = T.type_id
    LEFT JOIN Types_recycle TR ON P.type_recycle_id = TR.type_recycle_id
    WHERE P.barcode = ?
    ''', (barcode,))

    result = cursor.fetchone()

    if result:
        conn.close()
        return {
            "id": result[0],
            "name": result[1],
            "recycle_type": result[2],
            "product_type": result[3],
            "barcode": result[4],
            "green_score": result[5],
            "carbon_footprint": result[6],
            "number_of_verifications": result[7],
            "image_url": result[8]
        }

    cursor.execute('''
    INSERT INTO Product (name, type_recycle_id, type_id, barcode, green_score, carbon_footprint, number_of_verifications, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', ("Unknown Product", None, None, barcode, None, None, 0, None))

    conn.commit()

    new_id = cursor.lastrowid
    cursor.execute('''
    SELECT 
        P.id,
        P.name,
        TR.type_name,
        T.type_name,
        P.barcode,
        P.green_score,
        P.carbon_footprint,
        P.number_of_verifications,
        P.image_url
    FROM Product P
    LEFT JOIN Types T ON P.type_id = T.type_id
    LEFT JOIN Types_recycle TR ON P.type_recycle_id = TR.type_recycle_id
    WHERE P.id = ?
    ''', (new_id,))

    new_product = cursor.fetchone()
    conn.close()

    return {
        "id": new_product[0],
        "name": new_product[1],
        "recycle_type": new_product[2],
        "product_type": new_product[3],
        "barcode": new_product[4],
        "green_score": new_product[5],
        "carbon_footprint": new_product[6],
        "number_of_verifications": new_product[7],
        "image_url": new_product[8]
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
