// Stores the current exercice
let currentExercice = null;










function disableAnswerInputs() {
    const qcmDiv = document.getElementById('qcm');
    if (qcmDiv) {
        [...qcmDiv.querySelectorAll('input[type="radio"], .qcm-button')].forEach(el => {
            el.disabled = true;
            el.classList.add('disabled-interactivity');
        });
    }
    const jpInput = document.getElementById('jp-input');
    if (jpInput) {
        jpInput.disabled = true;
        jpInput.classList.add('disabled-interactivity');
    }
    const frInput = document.getElementById('fr-input');
    if (frInput) {
        frInput.disabled = true;
        frInput.classList.add('disabled-interactivity');
    }
}


function enableAnswerInputs() {
    const qcmDiv = document.getElementById('qcm');
    if (qcmDiv) {
        [...qcmDiv.querySelectorAll('input[type="radio"], .qcm-button')].forEach(el => {
            el.disabled = false;
            el.classList.remove('disabled-interactivity');
        });
    }
    const jpInput = document.getElementById('jp-input');
    if (jpInput) {
        jpInput.disabled = false;
        jpInput.classList.remove('disabled-interactivity');
    }
    const frInput = document.getElementById('fr-input');
    if (frInput) {
        frInput.disabled = false;
        frInput.classList.remove('disabled-interactivity');
    }
}








// Checks a qcm answer.
function checkQCMAnswer(selectedAnswer) {
    if (!currentExercice) {
        console.error("Aucun exercice en cours pour vérifier la réponse QCM.");
        return;
    }

	console.log("QCM");
    
	// DO THINGS

}

// Checks a jap answer.
function checkJapaneseAnswer(userAnswer) {
    if (!currentExercice) {
        console.error("Aucun exercice en cours pour vérifier la réponse japonaise.");
        return;
    }

	console.log("JAP");

	// DO THINGS

}


// Checks a fr answer.
function checkFrenchAnswer(userAnswer) {
    if (!currentExercice) {
        console.error("Aucun exercice en cours pour vérifier la réponse française.");
        return;
    }
   
	console.log("FR");

	// DO THINGS

}




// This switch the interface used to answer.
async function switchAnswerMethod(method, choices = null) {
    const methods = document.querySelectorAll('.answer-method');
    methods.forEach(div => {
        div.classList.remove('active');
        [...div.querySelectorAll('input, textarea, button, select')].forEach(el => {
            el.disabled = true;
        });
    });
    const activeDiv = document.getElementById(method);
    if (!activeDiv) {
        console.error(`Méthode de réponse '${method}' non trouvée.`);
        return;
    }
    activeDiv.classList.add('active');
    [...activeDiv.querySelectorAll('input, textarea, button, select')].forEach(el => {
        el.disabled = false;
    });

	// Updates the choices in case of a qcm.
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

			// Adds the listeners for the answer check function.
            span.addEventListener('click', () => {
                if (!span.classList.contains('disabled-interactivity')) {
                	checkQCMAnswer(choice);
				}
            });
            label.appendChild(input);
            label.appendChild(span);
            activeDiv.appendChild(label);
        });

	// Clears the content of the input.
    } else if (method === 'jap') {
		const jpInput = document.getElementById('jp-input');
		if (jpInput) jpInput.value = '';
	} else if (method === 'fr') {
		const frInput = document.getElementById('fr-input');
		if (frInput) frInput.value = '';
	}
}

// Initialize an exercice and display it.
async function initializeExercice(exercice) {
    currentExercice = exercice;
    const questionNumber = document.getElementById('question-number');
    const currentNumber = parseInt(questionNumber.textContent, 10);
    questionNumber.textContent = currentNumber + 1;

	// Switch the answer mode.
    const answer_type = exercice.answer_type;
    const choices = exercice?.choices ?? null;
    await switchAnswerMethod(answer_type, choices);

	// Renders the question.
    const flashcardFrontContent = document.querySelector('.flashcard-front .card-content');
    if (flashcardFrontContent && exercice.question) {
        flashcardFrontContent.innerHTML = '';
        const questionParagraph = document.createElement('p');
        questionParagraph.textContent = exercice.question;
        flashcardFrontContent.appendChild(questionParagraph);
    } else if (flashcardFrontContent) {
        flashcardFrontContent.innerHTML = '<p>Question non disponible.</p>';
    }
}

// Initializes the exercices.
async function initializeExercices() {
    const exercicesDataElement = document.getElementById('exercices-data');
    const exerciceType = exercicesDataElement.dataset.type;

	// Gets the exercices.
    let apiUrl = "";
    if (["kanji", "word", "radical", "all"].includes(exerciceType)) {
        apiUrl = `/api/dailies/exercices/${exerciceType}`;
    } else {
        console.error("Type d'exercice non valide :", exerciceType);
        return;
    }
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

		// Parses the json.
        const exercices = await response.json();
        if (exercices && exercices.exercices && exercices.exercices.length > 0) {
            await initializeExercice(exercices.exercices[0]); // Charge le premier exercice
        } else {
            console.warn("Aucun exercice trouvé dans la réponse de l'API.");
            const flashcardFrontContent = document.querySelector('.flashcard-front .card-content');
            if (flashcardFrontContent) {
                flashcardFrontContent.innerHTML = '<p>Aucune question disponible pour le moment.</p>';
            }
        }

	// Error during question loading.
    } catch (error) {
        console.error("Erreur lors du chargement des exercices :", error);
        const flashcardFrontContent = document.querySelector('.flashcard-front .card-content');
        if (flashcardFrontContent) {
            flashcardFrontContent.innerHTML = '<p>Erreur lors du chargement des questions.</p>';
        }
    }
}

// Adds the events to the page components.
document.addEventListener('DOMContentLoaded', () => {
    const jpInput = document.getElementById('jp-input');
    const frInput = document.getElementById('fr-input');

	// Setup the japanese input.
    if (window.wanakana) {
        wanakana.bind(jpInput);
    }
	jpInput.addEventListener('keydown', (event) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			checkJapaneseAnswer(jpInput.value);
		}
	});
    
	// Setup the french input.
	frInput.addEventListener('keydown', (event) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			checkFrenchAnswer(frInput.value);
		}
	});

	// Initializes the exercices.
    initializeExercices();
});