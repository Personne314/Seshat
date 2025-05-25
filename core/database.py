import sqlite3
from flask import g
from os import path
from pathlib import Path
from json import load, JSONDecodeError
from sys import exit



# Constants to check the structure of jsons.
_radical_fields = ["front", "name", "meaning", "mnemonic", "example"]
_radical_field_islist = [False, False, True, False, True]
_word_fields = ["front", "reading", "class", "meaning", "mnemonic", "example"]
_word_field_islist = [False, False, False, True, False, True]
_kanji_fields = ["front", "on", "kun", "meaning", "mnemonic", "example", "radical"]
_kanji_field_islist = [False, True, True, True, False, True, True]

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



#################################################################################
# This section defines functions used to initialize the database.				#
#################################################################################

# Checks the structure of a card dict.
def check_card_structure(json, fields, lists):
	if not isinstance(json, dict): return False
	for i in range(len(fields)):
		t = list if lists[i] else str
		e = json.get(fields[i], None)
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
	cursor = db.execute(f"INSERT INTO Deck (deck_name, is_active) VALUES ('{meta["name"]}', 0);")
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
	next_id = get_next_autoincrement_id(db, "Element")

	# Gets all the values from the cards.
	cards_values = []
	meaning_values = []
	example_values = []
	wordinfo_values = []
	for i in range(len(cards)):
		card = cards[i]
		if not check_card_structure(card, _word_fields, _word_field_islist):
			print(f"[SESHAT]: error: deck '{json_file}' card {i+1} is invalid")
			exit(1)

		# Stores the values in lists.
		cards_values.extend([deck_id, "word", card["front"], card["mnemonic"]])
		for meaning in card["meaning"]:
			meaning_values.extend([next_id, meaning])
		for example in card["example"]:
			example_values.extend([next_id, example])
		word_class = card["class"]
		wordinfo_values.extend([next_id, card["reading"], word_class])
		next_id += 1

	# Executes the requests to insert the values.
	cards_placeholder = ", ".join(["(?,?,?,?)"] * int(len(cards_values)/4))
	meaning_placeholder = ", ".join(["(?,?)"] * int(len(meaning_values)/2))
	example_placeholder = ", ".join(["(?,?)"] * int(len(example_values)/2))
	wordinfo_placeholder = ", ".join(["(?,?,?)"] * int(len(wordinfo_values)/3))
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
		f"INSERT INTO WordInfo (element_id, reading, word_class) VALUES {wordinfo_placeholder}",
		wordinfo_values
	)

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
		if not check_card_structure(card, _kanji_fields, _kanji_field_islist):
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
	files = list(json_dir.glob("**/*.json"))
	len_files = len(files)
	i = 0
	for json_file in files:
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
				i += 1
				print(f"[SESHAT]: info: {json_file} loaded into the database ({i}/{len_files})")

			except JSONDecodeError as e:
				print(f"[SESHAT]: error: deck '{json_file}' couldn't be loaded : {e}")
				exit(1)
		db.commit()	

	if len_files == i :
		print(f"[SESHAT]: info: database initialized\n")
	else :
		print(f"[SESHAT]: error: database initialization failed !\n")



#################################################################################
# This section defines functions to access deck data in the db.					#
#################################################################################

# Gets all the cards of the specified deck.
def db_get_deck_cards(name, tags):
	db = get_db()
	r = "radical" in tags
	w = "word" in tags
	k = "kanji" in tags
	if r and not w and not k:
		return db_get_deck_cards_radical(db, name)
	elif not r and w and not k:
		return db_get_deck_cards_word(db, name)
	elif not r and not w and k:
		return db_get_deck_cards_kanji(db, name)
	else :
		print(f"[SESHAT]: error: deck '{name}' tags must contains radical, word or kanji")
		return {}

# Gets all the cards of the specified radical deck.
def db_get_deck_cards_radical(db, name):
	request = f"""
	SELECT
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
			"meaning": [m.strip() for m in row["meaning"].split("|") if m.strip()],
			"example": [e.strip() for e in row["example"].split("|") if e.strip()]
		}
		for row in res
	]
	return data

# Gets all the cards of the specified word deck.
def db_get_deck_cards_word(db, name):
	request = f"""
	SELECT
		E.japanese_name,
		E.mnemonic,
		WI.reading AS reading,
		WI.word_class AS class,
		(SELECT GROUP_CONCAT(meaning, '|')
		 FROM Meaning M
		 WHERE M.element_id = E.id) AS meaning,
		(SELECT GROUP_CONCAT(example, '|')
		 FROM Example EX
		 WHERE EX.element_id = E.id) AS example
	FROM Element E
	JOIN Deck D ON E.deck_id = D.deck_id
	LEFT JOIN WordInfo WI ON E.id = WI.element_id
	WHERE E.element_type = 'word' AND D.deck_name = '{name}';
	"""
	res = db.execute(request)
	data = [
		{
			**dict(row),
			"meaning": [m.strip() for m in row["meaning"].split("|") if m.strip()] if row["meaning"] else [],
			"example": [e.strip() for e in row["example"].split("|") if e.strip()] if row["example"] else []
		}
		for row in res
	]
	return data

# Gets all the cards of the specified kanji deck.
def db_get_deck_cards_kanji(db, name):
	request = f"""
	SELECT 
		E.japanese_name,
		E.mnemonic,
		(SELECT GROUP_CONCAT(reading, '|') 
		FROM KanjiReading 
		WHERE element_id = E.id AND reading_type = 'on') AS "on",
		(SELECT GROUP_CONCAT(reading, '|') 
		FROM KanjiReading 
		WHERE element_id = E.id AND reading_type = 'kun') AS kun,
		(SELECT GROUP_CONCAT(meaning, '|') 
		FROM Meaning M 
		WHERE M.element_id = E.id) AS meaning,
		(SELECT GROUP_CONCAT(example, '|') 
		FROM Example EX 
		WHERE EX.element_id = E.id) AS example,
		(SELECT GROUP_CONCAT(radical, '|') 
		FROM KanjiRadical KR 
		WHERE KR.element_id = E.id) AS radical
	FROM Element E
	JOIN Deck D ON E.deck_id = D.deck_id
	WHERE E.element_type = 'kanji' AND D.deck_name = '{name}';
	"""
	res = db.execute(request)
	data = [
		{
			**dict(row),
			"on": [o.strip() for o in row["on"].split("|") if o.strip()],
			"kun": [k.strip() for k in row["kun"].split("|") if k.strip()],
			"radical": [r.strip() for r in row["radical"].split("|") if r.strip()],
			"meaning": [m.strip() for m in row["meaning"].split("|") if m.strip()],
			"example": [e.strip() for e in row["example"].split("|") if e.strip()]
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



#################################################################################
# This section defines functions to access the scores in the db.				#
#################################################################################

# This function updates a list of scores in the database.
# scores must be a list of (element_id, last_review, validation_count, difficulty).
def db_upsert_scores(scores):
	db = get_db()
	query = """
	INSERT INTO Score (element_id, last_review, validation_count, difficulty)
	VALUES (?, ?, ?, ?)
	ON CONFLICT(element_id) DO UPDATE SET
		last_review = excluded.last_review,
		validation_count = excluded.validation_count,
		difficulty = excluded.difficulty
	"""
	db.executemany(query, scores)
	db.commit()

# this function return a the n scores with the greater id as a
# list of (element_id, last_review, validation_count, difficulty).
def db_get_priority_elements(n):
	db = get_db()
	query = """
	SELECT element_id, last_review, validation_count, difficulty,
		CASE WHEN last_review IS NULL THEN 1e999  -- valeur approchant l'infini
			ELSE (julianday('now') - julianday(last_review)) / 
				(POWER(2, validation_count) * difficulty)
		END AS priority
	FROM Score
	ORDER BY priority DESC
	LIMIT ?
	"""
	cursor = db.execute(query, (n,))
	results = [(row[0], row[1], row[2], row[3]) for row in cursor.fetchall()]
	return results

# This function returns the list of all existing tags for one type of deck.
def db_get_decks_tags(deck_type):
	db = get_db()
	query = """
		SELECT dt2.tag as count
		FROM DeckTag dt1
		JOIN DeckTag dt2 ON dt1.deck_id = dt2.deck_id
		WHERE dt1.tag = ?
		AND dt2.tag != ?
		GROUP BY dt2.tag
		ORDER BY count DESC, dt2.tag COLLATE NOCASE ASC
	"""
	cursor = db.execute(query, (deck_type, deck_type))
	return [row[0] for row in cursor.fetchall()]












# This returns the decks 
def db_get_decks_by_tags(tags, min, amount):
	db = get_db()

	# Lists the decks that have all the tags.
	decks_query = """
		SELECT D.deck_id, D.deck_name, D.is_active
		FROM DeckTag DT
		JOIN Deck D ON DT.deck_id = D.deck_id
		WHERE DT.tag IN ({})
		GROUP BY D.deck_id
		HAVING COUNT(DISTINCT DT.tag) = ?
		ORDER BY LENGTH(D.deck_name), D.deck_name COLLATE NOCASE
		LIMIT ? OFFSET ?
	""".format(','.join('?' * len(tags)))
	params = tags + [len(tags), amount, min]
	decks = db.execute(decks_query, params).fetchall()
	if not decks: return []

	# Maps these decks before inserting the data.
	deck_map = {
		deck["deck_id"]: {
			"name": deck["deck_name"],
			"is_active": bool(deck["is_active"]),
			"content": []
		} 
		for deck in decks
	}
	deck_ids = tuple(deck_map.keys())

	# Gets all the elements data.
	elements_query = f"""
		SELECT 
			E.deck_id,
			E.japanese_name,
			COALESCE(S.validation_count, 0) AS validation_count
		FROM Element E
		LEFT JOIN Score S ON E.id = S.element_id
		WHERE E.deck_id IN ({','.join('?' * len(deck_ids))})
		ORDER BY E.japanese_name
	"""
	rows = db.execute(elements_query, deck_ids).fetchall()

	# Insert the data at the right place then converts the map to a sorted list.
	for row in rows:
		deck = deck_map[row["deck_id"]]
		deck["content"].append(
			[row[1], row[2]] if deck["is_active"] else row[1]
		)
	decks = list(deck_map.values())
	return sorted(
		decks, key=lambda x: (len(x["name"]), x["name"].lower()) 
	)
