import json
from model.type import *


class Flashcard:

	# Loads a flashcard from a json file.
	def __init__(self, path):
		self._path = path
		self._init = False
		try:
			with open(path, "r", encoding="utf-8") as file:
				data = json.load(file)

				# Gets the card type.
				self._type = data.get("type", None)
				if type(self._type) != str:
					print(f"[SESHAT]: error: '{path}' must define 'type' string field")
					return
				self._type = CardType.from_id(self._type)
				if self._type == None:
					print(f"[SESHAT]: error: 'type' in '{path}' must be word, kanji or radical")
					return

				# Loads the corresponding card.
				match self._type:
					case CardType.WORD:		
						if not self._load_word(data) : return
					case CardType.KANJI:
						if not self._load_kanji(data) : return
					case CardType.RADICAL:	
						if not self._load_radical(data) : return

		# Error managment.
		except FileNotFoundError:
			print(f"[SESHAT]: error: unable to open '{path}'")
			return
		except json.JSONDecodeError:
			print(f"[SESHAT]: error: '{path}' isn't a valid json file")
			return
		self._init = True

	# Loads a word flashcard.
	def _load_word(self, data):
		if not self._load_common(data) : return False
		self._reading = data.get("reading", None)
		self._word_class = data.get("class", None)
		if type(self._reading) != str: 
			print(f"[SESHAT]: error: '{self._path}' must define a 'reading' string field")
			return False
		if type(self._word_class) != str: 
			print(f"[SESHAT]: error: '{self._path}' must define a 'class' string field")
			return False
		self._word_class = WordType.from_id(self._word_class)
		if self._word_class == None:
			print(f"[SESHAT]: error: '{self._path}' must define a valid 'class' field")
			return False
		return True
	
	# Loads a kanji flashcard.
	def _load_kanji(self, data):
		if not self._load_common(data) : return False
		self._on = data.get("on", None)
		self._kun = data.get("kun", None)
		self._radical = data.get("radical", None)
		if type(self._on) != str:
			print(f"[SESHAT]: error: '{self._path}' must define a 'on' string field")
			return False
		if type(self._kun) != str:
			print(f"[SESHAT]: error: '{self._path}' must define a 'kun' string field")
			return False
		if type(self._radical) != list:
			print(f"[SESHAT]: error: '{self._path}' must define a 'radical' list field")
			return False
		for r in self._radical:
			if type(r) != str: 
				print(f"[SESHAT]: error: '{self._path}' 'radical' field must contain only strings")
				return False
		return True

	# Loads a radical flashcard.
	def _load_radical(self, data):
		if not self._load_common(data) : return False
		self._name = data.get("name", None)
		if type(self._name) != str:
			print(f"[SESHAT]: error: '{self._path}' must define a 'name' string field")
			return False
		return True

	# Loads the common flashcard data.
	def _load_common(self, data):
		self._front = data.get("front", None)
		self._meaning = data.get("meaning", None)
		self._mnemonic = data.get("mnemonic", None)
		self._example = data.get("example", None)
		if type(self._front) != str: 
			print(f"[SESHAT]: error: '{self._path}' must define a 'front' string field")
			return False
		if type(self._meaning) != str: 
			print(f"[SESHAT]: error: '{self._path}' must define a 'meaning' string field")
			return False
		if type(self._mnemonic) != str: 
			print(f"[SESHAT]: error: '{self._path}' must define a 'mnemonic' string field")
			return False
		if type(self._example) != list: 
			print(f"[SESHAT]: error: '{self._path}' must define an 'example' list field")
			return False
		for e in self._example:
			if type(e) != str: 
				print(f"[SESHAT]: error: '{self._path}' 'example' field must contain only strings")
				return False
		return True

	# Gets the initialisation state of the flashcard.
	@property
	def init(self):
		return self._init

	# Gets the type of the flashcard.
	@property
	def type(self):
		return self._type
	
	# Gets the front string of the flashcard.
	@property
	def front(self):
		return self._front
	
	# Gets the meaning string of the flashcard.
	@property
	def meaning(self):
		return self._meaning
	
	# Gets the mnemonic string of the flashcard.
	@property
	def mnemonic(self):
		return self._mnemonic
	
	# Gets the example list of the flashcard.
	@property
	def example(self):
		return self._example

	# Gets the name string of the flashcard in case of a radical.
	@property
	def name(self):
		if self._type != CardType.RADICAL: return None
		return self._name

	# Gets the on string of the flashcard in case of a kanji.
	@property
	def on(self):
		if self._type != CardType.KANJI: return None
		return self._on

	# Gets the kun string of the flashcard in case of a kanji.
	@property
	def kun(self):
		if self._type != CardType.KANJI: return None
		return self._kun

	# Gets the radical list of the flashcard in case of a kanji.
	@property
	def radical(self):
		if self._type != CardType.KANJI: return None
		return self._radical

	# Gets the reading string of the flashcard in case of a word.
	@property
	def reading(self):
		if self._type != CardType.WORD: return None
		return self._reading
	
	# Gets the word class string of the flashcard in case of a word.
	@property
	def word_class(self):
		if self._type != CardType.WORD: return None
		return self._word_class
