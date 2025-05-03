import sqlite3
from flask import g
from os import path, walk
from pathlib import Path
from json import load, JSONDecodeError
from sys import exit



# Database name.
DATABASE = 'app.db'



# Opens the database.
def get_db():
	if 'db' not in g:
		db_needs_init = not path.exists(DATABASE)
		g.db = sqlite3.connect(DATABASE)
		g.db.row_factory = sqlite3.Row 
		if db_needs_init:
			init_db()
	return g.db

# Closes the database.
def close_db(e=None):
	db = g.pop('db', None)
	if db is not None:
		db.close()



# Adds a deck in the database and returns it's id.
def create_deck(db, meta, json_file):

	# Inserts the deck.
	cursor = db.execute(f"INSERT INTO Deck (deck_name) VALUES ('{meta["name"]}');")
	deck_id = cursor.lastrowid
	
	# Inserts the tags.
	tags = meta.get("tags", [])
	if isinstance(tags, list) and all(isinstance(tag, str) for tag in tags):
		if tags:
			placeholders = ", ".join(["(?, ?)"] * len(tags))
			values = []
			for tag in tags:
				values.extend([deck_id, tag])
			db.execute(
				f"INSERT INTO DeckTag (deck_id, tag) VALUES {placeholders}",
				values
			)
	else:
		print(f"[SESHAT]: error: deck '{json_file}' tags must be a list of strings")
		exit(1)
	return deck_id



# Initialises the database.
def init_db():
	print(f"[SESHAT]: info: database initialization")

	# Creates the database.
	db = get_db()
	with open("schema.sql") as f:
		db.executescript(f.read())

	# Gets all the json deck files.
	json_dir = Path("static/data/new-deck/")
	for json_file in json_dir.glob("**/*.json"):
		with open(json_file, "r", encoding="utf-8") as f:
			try:

				# Loads the json data.
				data = load(f)
				meta = data["meta"]
				if not isinstance(meta, dict) or not isinstance(meta.get("name"), str):
					print(f"[SESHAT]: error: deck '{json_file}' meta is invalid")
					exit(1)

				# Adds the data to the database.
				create_deck(db, meta, json_file)
				print(f"[SESHAT]: info: {json_file} loaded into the database")

			except JSONDecodeError as e:
				print(f"[SESHAT]: error: deck '{json_file}' couldn't be loaded : {e}")
				exit(1)
	db.commit()
	print(f"[SESHAT]: info: database initialized")
