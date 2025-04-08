import requests
import json
import os
import math
import time
import logging
from typing import List, Dict, Optional, Union

# Konfiguracja logowania
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- Funkcja do pobierania danych z API dla jednego kodu ---
def fetch_product_data_from_api(barcode: str) -> Optional[Dict]:
    """
    Pobiera dane produktu z API Open Food Facts dla danego kodu kreskowego (v2 API).

    Args:
        barcode (str): Kod kreskowy produktu.

    Returns:
        Słownik z danymi produktu ('product') lub None w przypadku błędu/braku produktu.
    """
    api_url = f"https://world.openfoodfacts.org/api/v2/product/{barcode}.json"
    fields = "code,_id,product_name,product_name_en,categories_hierarchy,packaging_materials_tags,packagings,packaging,ecoscore_score,ecoscore_data,selected_images,image_front_url,image_url"
    api_url_with_fields = f"{api_url}?fields={fields}"

    logging.info(f"Wysyłanie zapytania do API dla kodu: {barcode}")
    headers = {'User-Agent': 'MyDataExtractorApp/1.0 (your.email@example.com)'} # WAŻNE: Zmień na swoje dane!

    try:
        response = requests.get(api_url_with_fields, headers=headers, timeout=20)
        response.raise_for_status()
        data = response.json()
        if "product" in data and data.get("product"):
            logging.info(f"Pomyślnie pobrano dane dla {barcode}.")
            return data.get("product")
        else:
            logging.warning(f"Produkt o kodzie {barcode} nie został znaleziony lub brak danych w odpowiedzi.")
            return None
    except requests.exceptions.HTTPError as http_err:
        if response.status_code == 404:
            logging.warning(f"Nie znaleziono produktu o kodzie: {barcode} (404 Not Found).")
        else:
            logging.error(f"Błąd HTTP podczas zapytania do API dla {barcode}: {http_err}")
        return None
    except requests.exceptions.Timeout:
        logging.error(f"Przekroczono czas oczekiwania na odpowiedź API dla {barcode}.")
        return None
    except requests.exceptions.RequestException as req_err:
        logging.error(f"Błąd połączenia lub zapytania do API dla {barcode}: {req_err}")
        return None
    except json.JSONDecodeError:
        logging.error(f"Błąd dekodowania odpowiedzi JSON z API dla {barcode}.")
        return None
    except Exception as e:
        logging.error(f"Nieoczekiwany błąd podczas pobierania danych dla {barcode}: {e}")
        return None


# --- Funkcja ekstrakcji opakowania ---
def extract_packaging_info(product: Dict) -> Optional[str]:
    """
    Ekstrahuje informacje o materiale opakowania z danych produktu.
    Priorytet: tags -> packagings[material] -> packaging text.
    """
    if not isinstance(product, dict): return None
    packaging_materials_tags = product.get("packaging_materials_tags")
    if packaging_materials_tags and isinstance(packaging_materials_tags, list):
        cleaned_tags = [tag.split(':')[-1] for tag in packaging_materials_tags if isinstance(tag, str)]
        if cleaned_tags:
            return ", ".join(cleaned_tags)
    packagings = product.get("packagings")
    if packagings and isinstance(packagings, list):
        materials_from_list = []
        for packaging_item in packagings:
            if isinstance(packaging_item, dict):
                material = packaging_item.get("material")
                if material and isinstance(material, str) and material.strip():
                    materials_from_list.append(material.split(':')[-1])
        if materials_from_list:
             unique_materials = sorted(list(set(materials_from_list)))
             return ", ".join(unique_materials)
    packaging_text = product.get("packaging")
    if packaging_text and isinstance(packaging_text, str) and packaging_text.strip():
        return packaging_text.strip()
    return None

# --- Funkcja ekstrakcji danych produktu (bez zmian) ---
def extract_product_info(product: Dict) -> Optional[Dict]:
    """
    Ekstrahuje kluczowe informacje o produkcie z danych pobranych z API.
    """
    if not isinstance(product, dict):
         print("Błąd wewnętrzny: extract_product_info otrzymało niepoprawne dane.")
         return None
    barcode = product.get("code") or product.get("_id")
    if not barcode:
        print("Pominięto produkt - brak kodu kreskowego w przekazanych danych.")
        return None
    product_name = None
    pn_field = product.get("product_name")
    if isinstance(pn_field, list):
        for name_entry in pn_field:
            if isinstance(name_entry, dict) and "lang" in name_entry and "text" in name_entry:
                lang = name_entry.get("lang")
                text = name_entry.get("text")
                if text and lang in ["en", "main"]:
                    product_name = text
                    break
        if product_name is None:
             for name_entry in pn_field:
                 if isinstance(name_entry, dict) and "text" in name_entry and name_entry.get("text"):
                     product_name = name_entry.get("text")
                     break
    elif isinstance(pn_field, str) and pn_field.strip():
        product_name = pn_field.strip()
    if product_name is None:
        name_en_field = product.get("product_name_en")
        if isinstance(name_en_field, str) and name_en_field.strip():
             product_name = name_en_field.strip()
    category = None
    categories_hierarchy = product.get("categories_hierarchy")
    if categories_hierarchy and isinstance(categories_hierarchy, list):
        for cat in reversed(categories_hierarchy):
             if isinstance(cat, str) and cat.startswith("en:"):
                category = cat.replace("en:", "")
                break
    ecoscore_raw = product.get("ecoscore_score")
    green_score = None
    if isinstance(ecoscore_raw, (int, float)):
         green_score = ecoscore_raw
    cf_raw = None
    ecoscore_data = product.get("ecoscore_data")
    if isinstance(ecoscore_data, dict):
         agribalyse_data = ecoscore_data.get("agribalyse")
         if isinstance(agribalyse_data, dict):
              cf_raw = agribalyse_data.get("co2_total")
    carbon_footprint = None
    if isinstance(cf_raw, (int, float)):
        carbon_footprint = cf_raw
    image_link = None
    selected_images = product.get("selected_images", {})
    if isinstance(selected_images, dict):
        front_images = selected_images.get("front", {})
        if isinstance(front_images, dict):
            display_images = front_images.get("display", {})
            if isinstance(display_images, dict):
                 image_link = display_images.get("en") or next(iter(display_images.values()), None)
    if image_link is None:
        image_link = product.get("image_front_url")
    if image_link is None:
         image_link = product.get("image_url")
    if not isinstance(image_link, str) or not image_link.strip():
         image_link = None

    return {
        "name": product_name,
        "barcode": barcode,
        "type_recycle": extract_packaging_info(product),
        "type": category,
        "green_score": green_score,
        "carbon_footprint": carbon_footprint,
        "image_url": image_link
    }

# --- Główna funkcja przetwarzająca Z LIMITEREM ---
def process_barcodes_from_file(barcodes_file: str, output_file: str = "api_processed_products.json", record_limit: int = 100) -> None: # Dodano record_limit
    """
    Wczytuje kody kreskowe z pliku, pobiera dane z API OFF dla określonej liczby kodów
    i zapisuje wyniki.

    Args:
        barcodes_file: Ścieżka do pliku tekstowego z kodami kreskowymi (jeden na linię).
        output_file: Ścieżka do wyjściowego pliku JSON.
        record_limit (int): Maksymalna liczba kodów kreskowych do przetworzenia.
    """
    try:
        with open(barcodes_file, 'r', encoding='utf-8') as f:
            barcodes = [line.strip() for line in f if line.strip()]
        if not barcodes:
            print(f"Plik {barcodes_file} jest pusty lub nie zawiera poprawnych kodów.")
            return
        print(f"Wczytano {len(barcodes)} kodów kreskowych z pliku {barcodes_file}.")
    except FileNotFoundError:
        print(f"Błąd: Plik z kodami kreskowymi '{barcodes_file}' nie został znaleziony.")
        return
    except Exception as e:
        print(f"Błąd podczas odczytu pliku z kodami '{barcodes_file}': {e}")
        return

    processed_products = []
    processed_count = 0 # Licznik faktycznie pobranych i przetworzonych
    skipped_count = 0   # Licznik pominiętych (błąd, brak danych)
    barcodes_to_process = barcodes[:record_limit] # Weź tylko pierwsze N kodów
    total_to_process = len(barcodes_to_process)

    print(f"Rozpoczynanie pobierania danych dla {total_to_process} kodów (limit: {record_limit})...")

    # Zmieniono pętlę, aby iterowała tylko po ograniczonej liście
    for i, barcode in enumerate(barcodes_to_process):
        # 1. Pobierz dane z API
        product_data_from_api = fetch_product_data_from_api(barcode)

        if product_data_from_api:
            # 2. Wyekstrahuj potrzebne informacje
            processed_data = extract_product_info(product_data_from_api)
            if processed_data:
                processed_products.append(processed_data)
                processed_count += 1
            else:
                logging.warning(f"Pominięto {barcode} - błąd podczas ekstrakcji danych z odpowiedzi API.")
                skipped_count += 1
        else:
            skipped_count += 1

        # Wyświetlanie postępu
        # Zmieniono, aby pokazywać postęp względem liczby kodów DO przetworzenia
        if (i + 1) % 10 == 0 or (i + 1) == total_to_process:
             progress = ((i + 1) / total_to_process) * 100
             logging.info(f"Postęp: {i + 1}/{total_to_process} ({progress:.1f}%)")

        # 3. Dodaj opóźnienie między zapytaniami
        time.sleep(0.5)

    # Zapisz wyniki do pliku
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(processed_products, f, ensure_ascii=False, indent=4)
        # Zaktualizowano komunikat końcowy
        print(f"\nZakończono. Próbowano przetworzyć {total_to_process} kodów.")
        print(f"Zapisano dane {processed_count} produktów do {output_file}")
        if skipped_count > 0:
            print(f"Pominięto {skipped_count} kodów (nie znaleziono / błąd API / błąd ekstrakcji). Sprawdź logi po szczegóły.")
    except IOError as e:
        print(f"Błąd zapisu do pliku {output_file}: {e}")

# --- Blok główny ---
if __name__ == "__main__":
    input_file = "polish_barcodes.txt"

    if not input_file:
        print("Nie podano ścieżki do pliku.")
    elif not os.path.exists(input_file):
        print(f"Błąd: Plik '{input_file}' nie istnieje.")
    else:
        output_file_input = "api_processed_products.json"
        # Zmieniono domyślną nazwę pliku wyjściowego
        output_file = output_file_input or "api_processed_products_limited.json"
        if not output_file.lower().endswith('.json'):
            output_file += ".json"

        # Wywołanie funkcji przetwarzającej z domyślnym limitem 100
        process_barcodes_from_file(input_file, output_file, record_limit=100)