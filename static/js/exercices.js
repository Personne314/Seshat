// Stores the current exercice
let allExercices = []
let currentExercice = -1;
let nextQuestion = false;
let correctAnswersCount = 0;
let startTime = null;
let totalQuestions = 0;

// Go to the next question. Returns false if there is no more questions.
function goToNextQuestion() {
    if (currentExercice < allExercices.length - 1) {
        currentExercice++;
        initializeExercice(currentExercice);
        return true;
    }
    // Si toutes les questions ont été répondues
    displayEndScreen(); // Affiche l'écran de fin
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
    const isCorrect = answers.includes(answer);
    if (isCorrect) {
        correctAnswersCount++; // Incrémente le compteur de bonnes réponses
    }
    renderAnswerResult(answer, answers, isCorrect);
}

// Checks a jap answer.
function checkJapaneseAnswer(answer) {
    if (currentExercice < 0) {
        console.error("Aucun exercice en cours pour vérifier la réponse japonaise.");
        return;
    }
    disableAnswerInputs();
    let answers = allExercices[currentExercice].answers;
    const isCorrect = answers.includes(answer);
    if (isCorrect) {
        correctAnswersCount++; // Incrémente le compteur de bonnes réponses
    }
    renderAnswerResult(answer, answers, isCorrect);
}

// Checks a fr answer.
function checkFrenchAnswer(answer) {
    if (currentExercice < 0) {
        console.error("Aucun exercice en cours pour vérifier la réponse française.");
        return;
    }
    disableAnswerInputs();
    let answers = allExercices[currentExercice].answers;
    const isCorrect = answers.includes(answer);
    if (isCorrect) {
        correctAnswersCount++; // Incrémente le compteur de bonnes réponses
    }
    renderAnswerResult(answer, answers, isCorrect);
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
    const activeCard = document.querySelector('.flashcard.active');
    if (activeCard) {
        activeCard.classList.remove('flipped');
    }
}

// Handle redirection after quiz ends
function handleEndScreenInteraction() {
    if (!document.getElementById('end-screen-overlay').classList.contains('active')) return;

    // Remove these listeners before redirecting to prevent multiple submissions.
    document.removeEventListener('click', handleEndScreenInteraction);
    document.removeEventListener('keydown', handleEndScreenInteraction);

    // Create a form element to submit data and trigger a full page redirect.
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/api/exercices/end';
    form.enctype = 'text/plain';
    const input = document.createElement('input');
    input.name = '_';
    input.value = JSON.stringify({});
    input.style.display = 'none';

    // Submit the form, causing a full page redirect.
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
}

// Displays the end screen with results.
function displayEndScreen() {
    const endTime = new Date();
    const durationInSeconds = (endTime - startTime) / 1000;
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.floor(durationInSeconds % 60);
    const percentage = totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;
    let message = "";
    let title = "";
    if (percentage >= 80) {
        message = "Félicitations ! Excellent travail !";
        title = "Quiz Terminé !";
    } else {
        message = "Bon effort ! Continuez à pratiquer pour vous améliorer !";
        title = "Quiz Terminé !";
    }

    // Update HTML elements.
    document.getElementById('end-screen-title').textContent = title;
    document.getElementById('final-score').textContent = percentage.toFixed(0);
    document.getElementById('final-duration').textContent = `${minutes} min ${seconds} sec`;
    document.getElementById('end-screen-message').textContent = message;

    // Show the end screen.
    document.body.classList.add('dim-blur');
    document.getElementById('end-screen-overlay').classList.add('active');
    document.querySelector('main').removeEventListener('click', handleNextQuestion);
    document.querySelector('footer').removeEventListener('click', handleNextQuestionFooter);
    document.removeEventListener('keydown', handleNextQuestionKeydown);
    document.addEventListener('click', handleEndScreenInteraction);
    document.addEventListener('keydown', handleEndScreenInteraction);
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
            totalQuestions = allExercices.length;
            currentExercice = 0;
            correctAnswersCount = 0;
            startTime = new Date();
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

// Handler for next question transition.
function handleNextQuestion(event) {
    if (event.target.closest('.answer-method')) return;
    if (nextQuestion) {
        goToNextQuestion();
    }
}

// Handler for next question transition.
function handleNextQuestionFooter(event) {
    if (!event.target.closest('.answer-method')) {
        handleNextQuestion(event);
    }
}

// Handler for next question transition.
function handleNextQuestionKeydown(event) {
    const activeElement = document.activeElement;
    const isInputFocused = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA';
    if (nextQuestion && (event.key === 'Enter' || event.key === ' ') && !isInputFocused) {
        event.preventDefault();
        handleNextQuestion(event);
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

    // Events for next question
    document.addEventListener('keydown', handleNextQuestionKeydown);
    document.querySelector('main').addEventListener('click', handleNextQuestion);
    document.querySelector('footer').addEventListener('click', handleNextQuestionFooter);

    // Initializes the exercices.
    initializeExercices();
});
