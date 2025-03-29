import math

from fetch_waste_bins import fetch_waste_bins

def closest_bin(x_user, y_user, type_user):
    bins = fetch_waste_bins(type_user)

    def distance(x1, y1, x2, y2):
        return math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)

    closest = min(bins, key=lambda bin: distance(x_user, y_user, bin[0], bin[1]), default=None)

    return closest