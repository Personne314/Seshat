import sqlite3
from flask import g
from os import path


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

# Initialises the database.
def init_db():
	db = get_db()
	with open('schema.sql') as f:
		db.executescript(f.read())
