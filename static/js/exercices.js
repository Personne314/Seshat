// Active an answer method. qcm, japanese or french.
async function switchAnswerMethod(method, choices) {
	const methods = document.querySelectorAll('.answer-method');
	methods.forEach(div => {
		div.classList.remove('active');
		[...div.querySelectorAll('input, textarea, button, select')].forEach(el => {
			el.disabled = true;
		});
	});
	const activeDiv = document.getElementById(method);
	activeDiv.classList.add('active');
	[...activeDiv.querySelectorAll('input, textarea, button, select')].forEach(el => {
		el.disabled = false;
	});

	// If the mode is qcm, updates the choices.
	if (method === 'qcm' && Array.isArray(choices)) {
		activeDiv.innerHTML = '';
		choices.forEach((choice, index) => {
			const label = document.createElement('label');
			const input = document.createElement('input');
			input.type = 'radio';
			input.name = 'qcm-answer';
			input.value = choice;
			input.classList.add('qcm-option');
			const span = document.createElement('span');
			span.classList.add('qcm-button');
			span.textContent = choice;
			label.appendChild(input);
			label.appendChild(span);
			activeDiv.appendChild(label);
		});
	}

}













// This function initialize the current exercice.
async function initializeExercice(exercice) {
	const questionNumber = document.getElementById('question-number');
	const currentNumber = parseInt(questionNumber.textContent, 10);
	questionNumber.textContent = currentNumber + 1;

	// Sets the answer type.
	console.log(exercice);
	const answer_type = exercice.answer_type;
	const choices = exercice?.choices ?? null;
	await switchAnswerMethod(answer_type, choices);



}










// This initializes all the exercices on the page loading.
async function initializeExercices() {
	const exercicesDataElement = document.getElementById('exercices-data');
	const exerciceType = exercicesDataElement.dataset.type;

	// Constructs the API URL and gets the JSON.
	let apiUrl = "";
	if (exerciceType == "kanji" ||
		exerciceType == "word" ||
		exerciceType == "radical" ||
		exerciceType == "all") {
		apiUrl = `/api/dailies/exercices/${exerciceType}`;
	}
	try {
		const response = await fetch(apiUrl);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		// Parses the JSON response.
		const exercices = await response.json();
		
		


		await initializeExercice(exercices["exercices"][0])




	} catch (error) {
		console.error("Error fetching exercises:", error);
	}
}











// Adds the listeners.
document.addEventListener('DOMContentLoaded', () => {
	const jpInput = document.getElementById('jp-input');
	if (jpInput && window.wanakana) {
		wanakana.bind(jpInput);
	}
	initializeExercices();
});

