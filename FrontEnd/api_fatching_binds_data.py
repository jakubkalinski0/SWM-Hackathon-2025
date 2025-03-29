import requests
import json

def fetch_waste_bins(type_filter=None):
    """
    Pobiera dane o koszach na śmieci i pojemnikach do segregacji w Krakowie
    """
    overpass_url = "https://overpass-api.de/api/interpreter"
    
    base_query = """
    [out:json][timeout:25];
    area["name"="Kraków"]["admin_level"="8"]->.krakow;
    (
      node["amenity"="waste_basket"](area.krakow);
      node["recycling_type"="container"](area.krakow);
      node["recycling:glass"="yes"](area.krakow);
      node["recycling:paper"="yes"](area.krakow);
      node["recycling:plastic"="yes"](area.krakow);
      node["recycling:cans"="yes"](area.krakow);
      node["recycling:cardboard"="yes"](area.krakow);
      node["recycling:waste"="yes"](area.krakow);
      node["recycling:green_waste"="yes"](area.krakow);
      node["recycling:scrap_metal"="yes"](area.krakow);
      node["recycling:magazines"="yes"](area.krakow);
      node["recycling:organic"="yes"](area.krakow);
      node["recycling:cartons"="yes"](area.krakow);
      node["recycling:clothes"="yes"](area.krakow);
      node["recycling:books"="yes"](area.krakow);
      node["recycling:small_appliances"="yes"](area.krakow);
      node["recycling:batteries"="yes"](area.krakow);
      node["recycling:cans"="*"](area.krakow);
      node["recycling:glass_bottles"="*"](area.krakow);
      node["recycling:plastic_bottles"="*"](area.krakow);
    );
    out body;
    """
    
    if type_filter:
        query = f"""
        [out:json][timeout:25];
        area["name"="Kraków"]["admin_level"="8"]->.krakow;
        (
          node["recycling:{type_filter}"="yes"](area.krakow);
        );
        out body;
        """
    else:
        query = base_query
    
    response = requests.get(overpass_url, params={'data': query})
    
    if response.status_code != 200:
        return {"error": "Failed to fetch data"}
    
    data = response.json()
    results = []
    
    for element in data.get("elements", []):
        lat = element.get("lat")
        lon = element.get("lon")
        tags = element.get("tags", {})
        
        type_ = "unknown"
        for key in tags:
            if key.startswith("recycling:") and tags[key] in ["yes", "*"]:
                type_ = key.replace("recycling:", "recycling_")
                break
        
        if "amenity" in tags and tags["amenity"] == "waste_basket":
            type_ = "waste_basket"
        
        results.append({"lat": lat, "lon": lon, "type": type_})
    
    with open("waste_bins.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    return results

if __name__ == "__main__":
    bins = fetch_waste_bins()
    print("Dane zapisane w waste_bins.json")
