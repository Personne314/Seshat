-- Basic Flashcard Element.
CREATE TABLE Element (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	deck_id INTEGER NOT NULL,
	element_type TEXT NOT NULL CHECK (element_type IN ('radical', 'kanji', 'word')),
	japanese_name TEXT NOT NULL, 
	mnemonic TEXT NOT NULL,
	FOREIGN KEY (deck_id) REFERENCES Deck(id) ON DELETE CASCADE
);

-- Meaning of an Element.
-- Element  1 <--> n  Meaning
CREATE TABLE Meaning (
	element_id INTEGER NOT NULL,
	meaning TEXT NOT NULL,
	PRIMARY KEY (element_id, meaning),
	FOREIGN KEY (element_id) REFERENCES Element(id) ON DELETE CASCADE
);

-- Example of use of an Element.
-- Element  1 <--> n  Example
CREATE TABLE Example (
	element_id INTEGER NOT NULL,
	example TEXT NOT NULL,
	PRIMARY KEY (element_id, example),
	FOREIGN KEY (element_id) REFERENCES Element(id) ON DELETE CASCADE
);



-- The reading of a kanji. Can be kun'yomi or on'yomi.
-- Element  1 <--> n  KanjiReading
CREATE TABLE KanjiReading (
	element_id INTEGER NOT NULL,
	reading TEXT NOT NULL,
	reading_type TEXT NOT NULL CHECK (reading_type IN ('on', 'kun')),
	PRIMARY KEY (element_id, reading),
	FOREIGN KEY (element_id) REFERENCES Element(id) ON DELETE CASCADE
);

-- Radicals composing a kanji.
-- Element  1 <--> n  KanjiRadical
CREATE TABLE KanjiRadical (
	element_id INTEGER NOT NULL,
	radical TEXT NOT NULL,
	PRIMARY KEY (element_id, radical),
	FOREIGN KEY (element_id) REFERENCES Element(id) ON DELETE CASCADE
);



-- Informations about a word
-- Element  1 <--> 1  WordInfo
CREATE TABLE WordInfo (
	element_id INTEGER PRIMARY KEY,
	reading TEXT NOT NULL,
	word_class TEXT NOT NULL,
	FOREIGN KEY (element_id) REFERENCES Element(id) ON DELETE CASCADE
);



-- The reading of a radical.
-- Element  1 <--> 1  RadicalReading
CREATE TABLE RadicalReading (
	element_id INTEGER PRIMARY KEY,
	reading TEXT NOT NULL,
	FOREIGN KEY (element_id) REFERENCES Element(id) ON DELETE CASCADE
);



-- This contains the score of an element.
-- Element  1 <--> 1  Score
CREATE TABLE Score (
	element_id INTEGER PRIMARY KEY,
	last_review DATE,
	validation_count INTEGER NOT NULL DEFAULT 0,
	difficulty REAL NOT NULL DEFAULT 1.0,
	FOREIGN KEY (element_id) REFERENCES Element(id) ON DELETE CASCADE
);



-- This contains all the decks.
-- Element  1 <--> 0  Deck
CREATE TABLE Deck (
	deck_id INTEGER PRIMARY KEY AUTOINCREMENT,
	deck_name TEXT NOT NULL,
	is_active INTEGER NOT NULL DEFAULT 0 CHECK (is_active IN (0, 1))
);

-- This contains all the deck tags.
-- Deck  1 <--> n  DeckTag
CREATE TABLE DeckTag (
	deck_id INTEGER,
	tag TEXT NOT NULL,
	PRIMARY KEY (deck_id, tag),
	FOREIGN KEY (deck_id) REFERENCES Deck(id) ON DELETE CASCADE
);
