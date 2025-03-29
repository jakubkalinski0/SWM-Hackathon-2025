import requests
import json
import math

def haversine_distance(lat1, lon1, lat2, lon2):
    """Oblicza odległość w kilometrach między dwoma punktami na Ziemi."""
    R = 6371  # Promień Ziemi w km
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def fetch_waste_bins(lat: float, lon: float, type_filter=None):
    overpass_url = "https://overpass-api.de/api/interpreter"

    if type_filter is None:
        query = """
        [out:json][timeout:25];
        area["name"="Kraków"]["admin_level"="8"]->.krakow;
        (
            node["amenity"="waste_basket"](area.krakow);
            node["recycling_type"="container"](area.krakow);
            node["recycling:paper"="yes"](area.krakow);
            node["recycling:glass"="yes"](area.krakow);
            node["recycling:plastic"="yes"](area.krakow);
            node["recycling:metal"="yes"](area.krakow);
            node["recycling:organic"="yes"](area.krakow);
            node["recycling:glass_bottles"="*"](area.krakow);
            node["recycling:plastic_bottles"="*"](area.krakow);
        );
        out body;
        """
    else:
        query = f"""
        [out:json][timeout:25];
        area["name"="Kraków"]["admin_level"="8"]->.krakow;
        (
          node["amenity"="waste_basket"](area.krakow);
          node["recycling:{type_filter}"="yes"](area.krakow);
        );
        out body;
        """

    response = requests.get(overpass_url, params={'data': query})

    if response.status_code != 200:
        return {"error": "Failed to fetch data"}

    data = response.json()
    results = []

    for element in data.get("elements", []):
        bin_lat = element.get("lat")
        bin_lon = element.get("lon")
        tags = element.get("tags", {})

        # Obliczamy odległość od podanej lokalizacji
        distance = haversine_distance(lat, lon, bin_lat, bin_lon)

        # Filtrujemy tylko te kosze, które są w odległości <= 1 km
        if distance <= 1:
            if "amenity" in tags and tags["amenity"] == "waste_basket":
                type_ = "waste_basket"
            elif f"recycling:{type_filter}" in tags:
                type_ = f"{type_filter}"
            else:
                type_ = "unknown"

            results.append([bin_lat, bin_lon, type_, round(distance, 3)])

    with open("waste_bins.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    return results


if __name__ == "__main__":
    lat, lon = 50.06143, 19.93658  # Przykładowe współrzędne w Krakowie
    bins = fetch_waste_bins(lat, lon, type_filter="glass")
    print(bins)
