from enum import Enum


# Enum for the types of cards.
class CardType(Enum):
	KANJI = "Kanji"
	WORD = "Mot"
	RADICAL = "Radical"

	# Returns the name corresponding to an id.
	def from_id(id):
		match id:
			case "kanji":	return CardType.KANJI
			case "word":	return CardType.WORD
			case "radical":	return CardType.RADICAL
			case _: return None


# Enum for the types of words.
class WordType(Enum):	
	ICHIDAN = "Groupe 2"	
	GODAN = "Groupe 1"	
	IRREGULAR = "Verbe Irrégulier"
	I_ADJ = "Adjectif en -i"
	NA_ADJ = "Adjectif en -na"
	PARTICLE = "Particule"
	ADVERB = "Adverbe"
	PRONOUN = "Pronom"
	CONJUNCTION = "Conjonction"

	# Returns the name corresponding to an id.
	def from_id(id):
		match id:
			case "ichidan":		return WordType.ICHIDAN
			case "godan":		return WordType.GODAN
			case "irregular":	return WordType.IRREGULAR
			case "i_adj":		return WordType.I_ADJ
			case "na_adj":		return WordType.NA_ADJ
			case "particle":	return WordType.PARTICLE
			case "adverb":		return WordType.ADVERB
			case "pronoun":		return WordType.PRONOUN
			case "conjuction":	return WordType.CONJUNCTION
			case _: return None
