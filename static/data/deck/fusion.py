import json
import os
import re
import argparse

# Argument parser pour récupérer le chemin du dossier
parser = argparse.ArgumentParser(description="Fusionne un deck JSON et ses cartes.")
parser.add_argument("folder", help="Chemin vers le dossier contenant _deck.json et les fichiers radical_X.json")
args = parser.parse_args()

folder_path = args.folder

# Lire _deck.json
with open(os.path.join(folder_path, "_deck.json"), "r", encoding="utf-8") as f:
    meta = json.load(f)

# Trouver tous les fichiers radical_X.json
card_files = []
for filename in os.listdir(folder_path):
    match = re.match(r"radical_(\d+)\.json$", filename)
    if match:
        index = int(match.group(1))
        card_files.append((index, filename))

# Trier les fichiers par index croissant
card_files.sort()

# Lire les objets des fichiers
cards = []
for _, filename in card_files:
    with open(os.path.join(folder_path, filename), "r", encoding="utf-8") as f:
        card = json.load(f)
        cards.append(card)

# Fusionner et écrire dans fusion.json
fusion_data = {
    "meta": meta,
    "cards": cards
}

with open(os.path.join("../new-deck", folder_path+".json"), "w", encoding="utf-8") as f:
    json.dump(fusion_data, f, ensure_ascii=False, indent=2)
