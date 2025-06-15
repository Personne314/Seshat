// Active an answer method. qcm, japanese or french.
function switchAnswerMethod(method) {
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
}









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
		
		


		console.log("Exercices data fetched successfully:", exercices);




	} catch (error) {
		console.error("Error fetching exercises:", error);
	}
}











// Adds the listeners.
document.addEventListener('DOMContentLoaded', () => {
	switchAnswerMethod('qcm');
	const jpInput = document.getElementById('jp-input');
	if (jpInput && window.wanakana) {
		wanakana.bind(jpInput);
	}
	initializeExercices();
});

