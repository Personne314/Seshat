from datetime import date
from os import path
from json import dump, load
from core.options import options



# Dailies informations.
DAILIES_FILE = "./dailies.json"
last_dailies = None



#################################################################################
# This section defines functions used to initialize the dailies.				#
#################################################################################

# This function creates a list of dailies for kanjis.
def dailies_generates_kanji():
	return []

# This function creates a list of dailies for words.
def dailies_generates_word():
	return []

# This function creates a list of dailies for radicals.
def dailies_generates_radical():
	return []

# This function loads the dailies file if there is one and creates 
# new dailies if the old ones don't exist or are outdated. 
def dailies_init():
	global last_dailies
	if last_dailies == None :
		if path.exists(DAILIES_FILE):
			with open(DAILIES_FILE, "r", encoding="utf-8") as f:
				last_dailies = load(f)
		else:
			last_dailies = {"date": None}
	if last_dailies["date"] != str(date.today()):
		last_dailies = {
			"date": str(date.today()),
			"kanji": dailies_generates_kanji(),
			"word": dailies_generates_word(),
			"radical": dailies_generates_radical()
		}
		with open(DAILIES_FILE, "w", encoding="utf-8") as f:
			dump(last_dailies, f, ensure_ascii=False, indent=4)
