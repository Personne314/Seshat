// Stores the current exercice
let allExercices = []
let currentExercice = -1;
let nextQuestion = false;

// Go to the next question. Returns false if there is no more questions.
function goToNextQuestion() {
    if (currentExercice < allExercices.length - 1) {
        currentExercice++;
        initializeExercice(currentExercice);
        return true;
    }
    return false;
}

// Flip the current card.
function flipActiveCard() {
    const activeCard = document.querySelector('.flashcard.active');
    if (activeCard) {
        activeCard.classList.toggle('flipped');
    }
}

// Deactivates all input methods.
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

// Activates the currently used input method.
function enableAnswerInputs(method) {
    if (method === 'qcm') {
        const qcmDiv = document.getElementById('qcm');
        if (qcmDiv) {
            [...qcmDiv.querySelectorAll('input[type="radio"], .qcm-button')].forEach(el => {
                el.disabled = false;
                el.classList.remove('disabled-interactivity');
            });
        }
    } else if (method === 'jap') {
        const jpInput = document.getElementById('jp-input');
        if (jpInput) {
            jpInput.disabled = false;
            jpInput.classList.remove('disabled-interactivity');
        }
    } else if (method === 'fr') {
        const frInput = document.getElementById('fr-input');
        if (frInput) {
            frInput.disabled = false;
            frInput.classList.remove('disabled-interactivity');
        }
    }
}

// This renders the back of the card and flip it.
function renderAnswerResult(given_elt, answer_elt, isCorrect) {
    const flashcardBackContent = document.querySelector('.flashcard-back .card-content');
    const flashcardBack = document.querySelector('.flashcard-back');
    if (!flashcardBackContent || !flashcardBack) {
        console.error("Unable to find flashcard back element.");
        return;
    }
    if (isCorrect) flashcardBackContent.innerHTML = `
        <div class="card-content">
            <h3 id="result-title" class="result-title-correct">Vrai</h3>
            <div id="given-answer">${answer_elt.join(", ")}</div>
        </div>
    `;
    else flashcardBackContent.innerHTML = `
        <div class="card-content">
            <h3 id="result-title" class="result-title-incorrect">Faux</h3>
            <div id="given-answer">${answer_elt.join(", ")}</div>
        </div>
    `;
    flipActiveCard();
    nextQuestion = true;
}

// Checks a qcm answer.
function checkQCMAnswer(answer) {
    if (currentExercice < 0) {
        console.error("Aucun exercice en cours pour vérifier la réponse QCM.");
        return;
    }
    disableAnswerInputs();
    let answers = allExercices[currentExercice].answers;
    renderAnswerResult(answer, answers, answers.includes(answer));
}

// Checks a jap answer.
function checkJapaneseAnswer(answer) {
    if (currentExercice < 0) {
        console.error("Aucun exercice en cours pour vérifier la réponse japonaise.");
        return;
    }
    disableAnswerInputs();
    let answers = allExercices[currentExercice].answers;
    renderAnswerResult(answer, answers, answers.includes(answer));
}

// Checks a fr answer.
function checkFrenchAnswer(answer) {
    if (currentExercice < 0) {
        console.error("Aucun exercice en cours pour vérifier la réponse française.");
        return;
    }
    disableAnswerInputs();
    let answers = allExercices[currentExercice].answers;
    renderAnswerResult(answer, answers, answers.includes(answer));
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
                    span.classList.add('clicked');
                    checkQCMAnswer(choice);
                }
            });
            label.appendChild(input);
            label.appendChild(span);
            activeDiv.appendChild(label);
        });

    // Clears the content of the input and sets focus.
    } else if (method === 'jap') {
        const jpInput = document.getElementById('jp-input');
        if (jpInput) {
            jpInput.value = '';
            jpInput.focus();
        }
    } else if (method === 'fr') {
        const frInput = document.getElementById('fr-input');
        if (frInput) {
            frInput.value = '';
            frInput.focus();
        }
    }
}

// Initialize an exercice and display it.
async function initializeExercice(id) {
    const questionNumber = document.getElementById('question-number');
    questionNumber.textContent = currentExercice+1;
    let exercice = allExercices[id];
    nextQuestion = false;

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
    
    // Remettre la carte à l'endroit
    const activeCard = document.querySelector('.flashcard.active');
    if (activeCard) {
        activeCard.classList.remove('flipped');
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
            allExercices = exercices.exercices;
            currentExercice = 0;
            await initializeExercice(0);
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

    // Handles the next question transition.
    function handleNextQuestion(event) {
        if (event.target.closest('.answer-method')) return;
        if (nextQuestion) {
            const didGoNext = goToNextQuestion();
            if (!didGoNext) {
                disableAnswerInputs();
                nextQuestion = false;
                console.log("END");
            }
        }
    }

    // Events for next question
    document.addEventListener('keydown', (event) => {
        const activeElement = document.activeElement;
        const isInputFocused = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA';
        if (nextQuestion && (event.key === 'Enter' || event.key === ' ') && !isInputFocused) {
            event.preventDefault();
            handleNextQuestion(event);
        }
    });
    document.querySelector('main').addEventListener('click', handleNextQuestion);
    document.querySelector('footer').addEventListener('click', (event) => {
        if (!event.target.closest('.answer-method')) {
            handleNextQuestion(event);
        }
    });

	// Initializes the exercices.
    initializeExercices();
});
