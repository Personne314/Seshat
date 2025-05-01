let kanaEnabled = true;
let boundInput = null;

window.addEventListener('DOMContentLoaded', () => {
	const input = document.getElementById('text-input');
	boundInput = input;

	if (kanaEnabled) {
		wanakana.bind(input);
	}

	// Exemple de question dynamique
	setQuestion("Quel est le nom de ce radical ?");
});

function toggleKana() {
	const input = boundInput;
	if (!input) return;

	kanaEnabled = !kanaEnabled;

	if (kanaEnabled) {
		wanakana.bind(input);
		console.log("Kana activé");
	} else {
		wanakana.unbind(input);
		console.log("Kana désactivé");
	}
}

function setQuestion(text) {
	const box = document.getElementById('question-box');
	box.textContent = text;
}
