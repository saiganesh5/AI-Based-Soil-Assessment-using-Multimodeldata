# soil_logic.py
import random

SOIL_DATABASE = {
    "Loam": {
        "ph": 6.7,
        "moisture": 45,
        "N": 130,
        "P": 32,
        "K": 250,
        "crops": ["Wheat", "Maize", "Tomato"],
        "fertilizer": {
            "N": "2.5 kg/acre",
            "P": "1.2 kg/acre",
            "K": "2.3 kg/acre"
        }
    },
    "Clay": {
        "ph": 7.2,
        "moisture": 55,
        "N": 150,
        "P": 40,
        "K": 320,
        "crops": ["Rice", "Cabbage"],
        "fertilizer": {
            "N": "2.0 kg/acre",
            "P": "1.0 kg/acre",
            "K": "2.0 kg/acre"
        }
    },
    "Sandy": {
        "ph": 6.0,
        "moisture": 25,
        "N": 60,
        "P": 15,
        "K": 140,
        "crops": ["Groundnut", "Watermelon"],
        "fertilizer": {
            "N": "4.0 kg/acre",
            "P": "2.5 kg/acre",
            "K": "3.0 kg/acre"
        }
    }
}

def analyze_soil(location, crop=None):
    soil_type = random.choice(list(SOIL_DATABASE.keys()))
    soil = SOIL_DATABASE[soil_type]

    crop_suitable = False
    if crop:
        crop_suitable = crop.capitalize() in soil["crops"]

    return {
        "soil_type": soil_type,
        "ph": soil["ph"],
        "moisture": soil["moisture"],
        "nutrients": {
            "N": soil["N"],
            "P": soil["P"],
            "K": soil["K"]
        },
        "recommended_crops": soil["crops"],
        "fertilizer": soil["fertilizer"],
        "crop_suitable": crop_suitable,
        "location": location
    }
