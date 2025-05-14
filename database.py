import sqlite3
from flask import g
from os import path
from pathlib import Path
from json import load, JSONDecodeError, dump
from flask import jsonify
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




# Constants to check the structure of jsons.
_radical_fields = ["front", "name", "meaning", "mnemonic", "example"]
_radical_field_islist = [False, False, True, False, True]

# Checks the structure of a card dict.
def check_card_structure(json, fields, lists):
	if not isinstance(json, dict): return False
	for i in range(len(fields)):
		t = list if _radical_field_islist[i] else str
		e = json.get(_radical_fields[i], None)
		if not isinstance(e, t): return False
		if isinstance(e, list):
			for elt in e :
				if not isinstance(elt, str): return False
	return True

# Returns the next id that will be used as primary key by an autoincrement.
def get_next_autoincrement_id(db, table):
	result = db.execute(f"SELECT seq FROM sqlite_sequence WHERE name='{table}'").fetchone()
	if result: return result[0] + 1
	else: return 1


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
			# db.execute(
			# 	f"INSERT INTO DeckTag (deck_id, tag) VALUES {placeholders}",
			# 	values
			# )
			try:
				db.execute(
					f"INSERT INTO DeckTag (deck_id, tag) VALUES {placeholders}",
					values
				)
			except sqlite3.IntegrityError as e:
				print(f"[ERROR]: IntegrityError while inserting into DeckTag: {e}")
				print(f"Tags being inserted: {tags}")
				print(f"Deck ID: {deck_id}")
				exit(1)
	else:
		print(f"[SESHAT]: error: deck '{json_file}' tags must be a list of strings")
		exit(1)
	return deck_id

# Adds all the cards from a deck to the database.
def create_cards(db, deck_id, cards, tags, json_file):
	r = "radical" in tags
	w = "word" in tags
	k = "kanji" in tags
	if r and not w and not k:
		create_cards_radical(db, deck_id, cards, json_file)
	elif not r and w and not k:
		create_cards_word(db, deck_id, cards, json_file)
	elif not r and not w and k:
		create_cards_kanji(db, deck_id, cards, json_file)
	else :
		print(f"[SESHAT]: error: deck '{json_file}' tags must contains radical, word or kanji")
		exit(1)

# Adds all the radical cards from a deck to the database.
def create_cards_radical(db, deck_id, cards, json_file):
	next_id = get_next_autoincrement_id(db, "Element")

	# Gets all the values from the cards.
	cards_values = []
	meaning_values = []
	example_values = []
	reading_values = []
	for i in range(len(cards)):
		card = cards[i]
		if not check_card_structure(card, _radical_fields, _radical_field_islist):
			print(f"[SESHAT]: error: deck '{json_file}' card {i+1} is invalid")
			exit(1)

		# Stores the values in lists.
		cards_values.extend([deck_id, "radical", card["front"], card["mnemonic"]])
		for meaning in card["meaning"]:
			meaning_values.extend([next_id, meaning])
		for example in card["example"]:	
			example_values.extend([next_id, example])
		reading_values.extend([next_id, card["name"]])
		next_id += 1

	# Executes the requests to insert the values.
	cards_placeholder = ", ".join(["(?,?,?,?)"] * int(len(cards_values)/4))
	meaning_placeholder = ", ".join(["(?,?)"] * int(len(meaning_values)/2))
	example_placeholder = ", ".join(["(?,?)"] * int(len(example_values)/2))
	reading_placeholder = ", ".join(["(?,?)"] * int(len(reading_values)/2))
	db.execute(
		f"INSERT INTO Element (deck_id, element_type, japanese_name, mnemonic) VALUES {cards_placeholder}",
		cards_values
	)
	db.execute(
		f"INSERT INTO Meaning (element_id, meaning) VALUES {meaning_placeholder}",
		meaning_values
	)
	db.execute(
		f"INSERT INTO Example (element_id, example) VALUES {example_placeholder}",
		example_values
	)
	db.execute(
		f"INSERT INTO RadicalReading (element_id, reading) VALUES {reading_placeholder}",
		reading_values
	)












# Adds all the word cards from a deck to the database.
def create_cards_word(db, deck_id, cards, json_file):
	pass












# Adds all the kanji cards from a deck to the database.
def create_cards_kanji(db, deck_id, cards, json_file):
	next_id = get_next_autoincrement_id(db, "Element")
	
	# Gets all the values from the cards.
	cards_values = []
	meaning_values = []
	example_values = []
	reading_values = []
	radical_values = []
	for i in range(len(cards)):
		card = cards[i]
		if not isinstance(card, dict):
			print(f"[SESHAT]: error: deck '{json_file}' card {i+1} is invalid")
			exit(1)

		# Récupération des champs obligatoires
		front = card.get("front")
		mnemonic = card.get("mnemonic")
		meanings = card.get("meaning", [])
		examples = card.get("example", [])
		readings_on = card.get("on", [])
		readings_kun = card.get("kun", [])
		radicals = card.get("radical", [])

		# Stores the values in lists.
		cards_values.extend([deck_id, "kanji", front, mnemonic])
		for meaning in meanings:
			if not isinstance(meaning, str): continue
			meaning_values.extend([next_id, meaning])
		for example in examples:
			if not isinstance(example, str): continue
			example_values.extend([next_id, example])
		for on_reading in readings_on:
			if not isinstance(on_reading, str): continue
			reading_values.extend([next_id, on_reading, "on"])
		for kun_reading in readings_kun:
			if not isinstance(kun_reading, str): continue
			reading_values.extend([next_id, kun_reading, "kun"])
		for radical in radicals:
			if not isinstance(radical, str): continue
			radical_values.extend([next_id, radical])
		next_id += 1

	# Executes the requests to insert the values.
	cards_placeholder = ", ".join(["(?,?,?,?)"] * (len(cards_values)//4))
	meaning_placeholder = ", ".join(["(?,?)"] * (len(meaning_values)//2))
	example_placeholder = ", ".join(["(?,?)"] * (len(example_values)//2))
	reading_placeholder = ", ".join(["(?,?,?)"] * (len(reading_values)//3))
	radical_placeholder = ", ".join(["(?,?)"] * (len(radical_values)//2))
	db.execute(
		f"INSERT INTO Element (deck_id, element_type, japanese_name, mnemonic) VALUES {cards_placeholder}",
		cards_values
	)
	db.execute(
		f"INSERT INTO Meaning (element_id, meaning) VALUES {meaning_placeholder}",
		meaning_values
	)
	db.execute(
		f"INSERT INTO Example (element_id, example) VALUES {example_placeholder}",
		example_values
	)
	db.execute(
		f"INSERT INTO KanjiReading (element_id, reading, reading_type) VALUES {reading_placeholder}",
		reading_values
	)
	db.execute(
		f"INSERT INTO KanjiRadical (element_id, radical) VALUES {radical_placeholder}",
		radical_values
	)



# Initialises the database.
def init_db():
	print(f"[SESHAT]: info: database initialization")

	# Creates the database.
	db = get_db()
	with open("schema.sql") as f:
		db.executescript(f.read())

	# Gets all the json deck files.
	json_dir = Path("static/data/deck/")
	for json_file in json_dir.glob("**/*.json"):
		with open(json_file, "r", encoding="utf-8") as f:
			try:

				# Loads the json data.
				data = load(f)
				meta = data["meta"]
				cards = data["cards"]
				if not isinstance(meta, dict) or not isinstance(meta.get("name"), str) \
				or not isinstance(cards, list) or not isinstance(meta.get("tags"), list):
					print(f"[SESHAT]: error: deck '{json_file}' meta is invalid")
					exit(1)
				tags = meta["tags"]

				# Adds the data to the database.
				deck_id = create_deck(db, meta, json_file)
				create_cards(db, deck_id, cards, tags, json_file)
				
				print(f"[SESHAT]: info: {json_file} loaded into the database")

			except JSONDecodeError as e:
				print(f"[SESHAT]: error: deck '{json_file}' couldn't be loaded : {e}")
				exit(1)
		db.commit()	
	print(f"[SESHAT]: info: database initialized\n")



# This section defines functions to access specific data in the db.

# Gets all the cards of the specified deck.
def db_get_deck_cards(name):
	db = get_db()
	request = f"""
	SELECT 
		E.id,
		E.japanese_name,
		E.mnemonic,
		RR.reading AS radical_reading,
		(SELECT GROUP_CONCAT(meaning, '|') 
		FROM Meaning M 
		WHERE M.element_id = E.id) AS meaning,
		(SELECT GROUP_CONCAT(example, '|') 
		FROM Example EX
		WHERE EX.element_id = E.id) AS example
	FROM Element E
	JOIN Deck D ON E.deck_id = D.deck_id
	LEFT JOIN RadicalReading RR ON E.id = RR.element_id
	WHERE E.element_type = 'radical' AND D.deck_name = '{name}';
	"""
	res = db.execute(request)
	data = [
		{
			**dict(row),
			'meaning': [m.strip() for m in row['meaning'].split('|') if m.strip()],
			'example': [e.strip() for e in row['example'].split('|') if e.strip()]
		}
		for row in res
	]
	return data

# Gets a deck metadata.
def db_get_deck_meta(name):
	db = get_db()
	request = f"""
		SELECT 
			D.deck_name as name,
			(SELECT GROUP_CONCAT(tag, '|') 
			FROM DeckTag DT 
			WHERE DT.deck_id = D.deck_id) AS tags
		FROM Deck D
		WHERE D.deck_name = '{name}';
	"""
	res = db.execute(request)
	data = [
		{
			**dict(row),
			'tags': [t.strip() for t in row['tags'].split('|') if t.strip()]
		}
		for row in res
	]
	return data[0]
