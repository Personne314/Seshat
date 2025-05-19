from os import path
from json import dump, load



# Options informations.
OPTIONS_FILE = "./options.json"
options = None



#################################################################################
# This section defines functions used to initialize the options.				#
#################################################################################

# This function returns the default app options.
def options_create_default():
	return {
		"raicals-dailies-amount": 5,
		"kanjis-dailies-amount": 0,
		"words-dailies-amount": 0
	}

# This function loads the options and creates a default
# option files if the option file couldn't be found.
def options_init():
	global options
	if options == None :
		if path.exists(OPTIONS_FILE):
			with open(OPTIONS_FILE, "r", encoding="utf-8") as f:
				options = load(f)
		else:
			options = options_create_default()
			with open(OPTIONS_FILE, "w", encoding="utf-8") as f:
				dump(options, f, ensure_ascii=False, indent=4)
