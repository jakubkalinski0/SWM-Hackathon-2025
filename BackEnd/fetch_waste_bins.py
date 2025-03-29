import requests
import json

"""
Connects to site 'overpass-turbo.eu' which contains information about bins and the types of waste that they can absorb.
Returns the json file with all bins that we are interested in in our app.
"""

def fetch_waste_bins(type_filter=None):
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
        lat = element.get("lat")
        lon = element.get("lon")
        tags = element.get("tags", {})

        if "amenity" in tags and tags["amenity"] == "waste_basket":
            type_ = "waste_basket"
        elif f"recycling:{type_filter}" in tags:
            type_ = f"recycling_{type_filter}"
        else:
            type_ = "unknown"

        results.append([lat, lon, type_])

    with open("waste_bins.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    return results


if __name__ == "__main__":
    bins = fetch_waste_bins(type_filter=None)
    print("Data saved to waste_bins.json")