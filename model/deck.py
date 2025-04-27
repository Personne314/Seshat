import json
from model.flashcard import *
from glob import glob
from os.path import basename



# This class is used to represent the model of a deck.
# This can load a deck from a folder containing json files.
# To be valid, a deck must at least contains _deck.json
class Deck:

	# Loads a deck from a folder.
	def __init__(self, path):
		self._init = False
		self._path = f"./data/deck/{path}"
		self._cards = {}

		# Loads the deck metadata. 
		try:
			meta_file = f"{self._path}/_deck.json"
			with open(meta_file, "r", encoding="utf-8") as file:
				data = json.load(file)
				self._name = data.get("name", None)
				self._tags = data.get("tags", None)
				if type(self._name) != str: 
					print(f"[SESHAT]: error: '{meta_file}' must define a 'name' string field")
					return
				if type(self._tags) != list: 
					print(f"[SESHAT]: error: '{meta_file}' must define a 'tags' list field")
					return
				for t in self._tags:
					if type(t) != str: 
						print(f"[SESHAT]: error: '{meta_file}' 'tags' field must contain only strings")
						return

		# Error managment.
		except FileNotFoundError:
			print(f"[SESHAT]: error: unable to open '{path}'")
			return
		except json.JSONDecodeError:
			print(f"[SESHAT]: error: '{self._path}' isn't a valid json file")
			return

		# Loads the deck cards.
		for file in glob(f"{self._path}/*.json"):
			if (basename(file) != "_deck.json"):
				card = Flashcard(file)
				if not card.init :
					print(f"[SESHAT]: error: unable to load the deck '{self._path}'")
					return
				self._cards[card.front] = card
		self._init = True

	# Iterator on the cards.
	def __iter__(self):
		return iter(self._cards.keys())

	# Card getter.
	def __getitem__(self, key):
		return self._cards.get(key, None)

	# Gets the initialisation state of the deck.
	@property
	def init(self):
		return self._init

	# Gets the name of a deck.
	@property
	def name(self):
		return self._name
	
	# Gets the tags of the deck.
	@property
	def tags(self):
		return self._tags
