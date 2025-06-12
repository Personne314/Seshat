from random import shuffle, sample
from core.database import *



EXERCICES_PER_ELT = 2







# This function returns a list of exercices for a kanji.
def exercices_create_kanji(kanji, info):
	other_kanjis = [x for x in info["kanji"] if x != kanji["japanese"]]
	qcm_answer = [kanji["japanese"]] + \
		(sample(other_kanjis, 4) if len(other_kanjis) > 4 else other_kanjis)
	shuffle(qcm_answer)
	return [
		{
			"answer_type": "fr",
			"answers": kanji["meaning"],
			"question": f"Que signifie le kanji '{kanji["japanese"]}' en français ?"
		},
		{	
			"answer_type": "qcm",
			"answers": qcm_answer,
			"expected": kanji["japanese"],
			"question": f"Parmis les kanji suivants, lequel veut dire '{", ".join(kanji["meaning"])}' ?"
		}
	]

# This function returns a list of exercices for a word.
def exercices_create_word(word, info):
	other_words = [x for x in info["word"] if x != word["japanese"]]
	qcm_answer = [word["japanese"]] + \
		(sample(other_words, 4) if len(other_words) > 4 else other_words)
	shuffle(qcm_answer)
	return [
		{
			"answer_type": "fr",
			"answers": word["meaning"],
			"question": f"Que signifie le mot '{word["japanese"]}' en français ?"
		},
		{	
			"answer_type": "qcm",
			"answers": qcm_answer,
			"expected": word["japanese"],
			"question": f"Parmis les mots suivants, lequel veut dire '{", ".join(word["meaning"])}' ?"
		}
	]

# This function returns a list of exercices for a radical.
def exercices_create_radical(radical, info):
	other_radicals = [x for x in info["radical"] if x != radical["japanese"]]
	qcm_answer = [radical["japanese"]] + \
		(sample(other_radicals, 4) if len(other_radicals) > 4 else other_radicals)
	shuffle(qcm_answer)
	return [
		{
			"answer_type": "fr",
			"answers": radical["meaning"],
			"question": f"Que signifie le radical '{radical["japanese"]}' en français ?"
		},
		{	
			"answer_type": "qcm",
			"answers": qcm_answer,
			"expected": radical["japanese"],
			"question": f"Parmis les radicaux suivants, lequel veut dire '{", ".join(radical["meaning"])}' ?"
		}
	]

# This function returns a list of exercices for a card.
def exercices_create(card, info):
	exercices = []
	if card["type"] == "kanji":
		exercices = exercices_create_kanji(card, info)
	elif card["type"] == "word":
		exercices = exercices_create_word(card, info)
	elif card["type"] == "radical":
		exercices = exercices_create_radical(card, info)
	shuffle(exercices)

	print(exercices	)

	return exercices[0:EXERCICES_PER_ELT]
