from datetime import date
from os import path
from json import dump, load
from core.options import get_options
from core.database import db_get_priority_elements, db_update_scores
from os import remove



# Dailies informations.
DAILIES_FILE = "./dailies.json"
last_dailies = None



#################################################################################
# This section defines functions used to initialize the dailies.				#
#################################################################################

# This function creates a list of dailies for kanjis.
def dailies_generates_kanji():
	n = get_options()["kanjis-dailies-amount"]
	return db_get_priority_elements(n, "kanji")

# This function creates a list of dailies for words.
def dailies_generates_word():
	n = get_options()["words-dailies-amount"]
	return db_get_priority_elements(n, "word")

# This function creates a list of dailies for radicals.
def dailies_generates_radical():
	n = get_options()["radicals-dailies-amount"]
	return db_get_priority_elements(n, "radical")

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
			"dailies": {
				"kanji": dailies_generates_kanji(),
				"word": dailies_generates_word(),
				"radical": dailies_generates_radical()
			},
			"errors": {
				"kanji": [],
				"word": [],
				"radical": []
			}
		}
	with open(DAILIES_FILE, "w", encoding="utf-8") as f:
		dump(last_dailies, f, ensure_ascii=False, indent=4)



#################################################################################
# This section defines functions used to manipulate the dailies.				#
#################################################################################

# This deletes the dailies file.
def dailies_delete():
	global last_dailies
	if path.isfile("dailies.json"):
		remove("dailies.json")
	last_dailies = None

# This returns the set of dailies to do.
def dailies_get_todo():
	global last_dailies
	if last_dailies == None :
		dailies_init()
	return last_dailies["dailies"]

# This returns the set of dailies errors.
def dailies_get_error():
	global last_dailies
	if last_dailies == None :
		dailies_init()
	return last_dailies["errors"]

# This process the result of the dailies exercices.
def dailies_process_result(results):
	global last_dailies
	current_date = str(date.today())
	id_type = {}
	new_dailies = {
		"date": current_date,
		"dailies": {
			"kanji": [],
			"word": [],
			"radical": []
		},
		"errors": dict(last_dailies["errors"])
	}
	to_update = []

	# This update the dailies elements that have been worked on.
	for i in range(len(last_dailies["dailies"]["kanji"])) : 
		id_type[str(last_dailies["dailies"]["kanji"][i][1])] = ["kanji",i]
	for i in range(len(last_dailies["dailies"]["word"])) : 
		id_type[str(last_dailies["dailies"]["word"][i][1])] = ["word",i]
	for i in range(len(last_dailies["dailies"]["radical"])) : 
		id_type[str(last_dailies["dailies"]["radical"][i][1])] = ["radical",i]
	for id in results :
		win, total = results[id]
		id_type[id].append(None)

		# Case of an error on a word.
		if win < total :
			state = last_dailies["dailies"][id_type[id][0]][id_type[id][1]]
			state[2] = current_date
			if state[3] > 0 : state[3] -= 1
			state[4] *= 1.2
			if state[4] > 2 : state[4] = 2
			new_dailies["errors"][id_type[id][0]].append(state)
			to_update.append([state[1],state[2],state[3],state[4]])

		# Case of no error on a word.
		else :
			state = last_dailies["dailies"][id_type[id][0]][id_type[id][1]]
			state[2] = current_date
			state[3] += 1
			state[4] *= 0.9
			if state[4] < 0.8 : state[4] = 0.8
			to_update.append([state[1],state[2],state[3],state[4]])

	# Update the database.
	db_update_scores(to_update)

	# Add the unchanged elements and update the dailies.
	for id in id_type :
		if len(id_type[id]) == 2 :
			new_dailies["dailies"][id_type[id][0]].append(last_dailies["dailies"][id_type[id][0]][id_type[id][1]])
	last_dailies = new_dailies
	with open(DAILIES_FILE, "w", encoding="utf-8") as f:
		dump(last_dailies, f, ensure_ascii=False, indent=4)
