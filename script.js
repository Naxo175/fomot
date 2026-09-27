let words = [];
let currentWord = null;

let usedWords = JSON.parse(localStorage.getItem('fomot_used_words')) || [];
let score = parseInt(localStorage.getItem('fomot_score')) || 0;

const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const btnStart = document.getElementById('btn-start');

const scoreDisplay = document.getElementById('score-display');
const wordDisplay = document.getElementById('word-display');
const buttonsContainer = document.getElementById('buttons-container');

const resultMessage = document.getElementById('result-message');
const descriptionBox = document.getElementById('description-box');
const descriptionText = document.getElementById('description-text');
const btnNext = document.getElementById('btn-next');

const sourceDisplay = document.getElementById('source-display');
const sourceLink = document.getElementById('source-link');
const historyList = document.getElementById('history-list');

const btnToggleMenu = document.getElementById('btn-toggle-menu');
const historySidebar = document.getElementById('history-sidebar');

async function loadWords() {
    try {
        const response = await fetch('words.json');
        const data = await response.json();
        words = data.filter(w => w.mot && w.mot.trim() !== "");
        updateHistoryUI();
    } catch (error) {
        console.error("Impossible de charger words.json :", error);
    }
}

function startGame() {
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    updateScoreDisplay();
    showNextWord();
}

function updateScoreDisplay() {
    if (scoreDisplay) {
        scoreDisplay.textContent = `Score : ${score} pts`;
    }
}

function updateHistoryUI() {
    if (!historyList) return;
    historyList.innerHTML = '';
    usedWords.forEach(word => {
        const li = document.createElement('li');
        li.textContent = word;
        historyList.appendChild(li);
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function showNextWord() {
    const remainingWords = words.filter(item => !usedWords.includes(item.mot));

    if (remainingWords.length === 0) {
        wordDisplay.textContent = "Plus de mots pour aujourd'hui ! Reviens demain pour de nouveaux défis.";
        wordDisplay.style.fontSize = "32px";
        resultMessage.classList.add('hidden');
        buttonsContainer.classList.add('hidden');
        descriptionBox.classList.add('hidden');
        sourceDisplay.classList.add('hidden');
        return;
    }

    const randomIndex = Math.floor(Math.random() * remainingWords.length);
    currentWord = remainingWords[randomIndex];

    wordDisplay.textContent = currentWord.mot;

    const options = [
        { text: currentWord.correctDefinition, isCorrect: true }
    ];

    if (Array.isArray(currentWord.fakeDefinitions)) {
        currentWord.fakeDefinitions.forEach(def => {
            options.push({ text: def, isCorrect: false });
        });
    }

    const shuffledOptions = shuffleArray(options);

    buttonsContainer.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D', 'E'];

    shuffledOptions.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'btn-choice';
        button.innerHTML = `${letters[index] || index + 1}. ${option.text}`;
        
        button.addEventListener('click', () => checkAnswer(option.isCorrect));
        buttonsContainer.appendChild(button);
    });

    resultMessage.classList.add('hidden');
    descriptionBox.classList.add('hidden');
    buttonsContainer.classList.remove('hidden');
    sourceDisplay.classList.add('hidden');
}

function checkAnswer(isCorrect) {
    if (!currentWord) return;

    if (isCorrect) {
        score += 100;
        resultMessage.textContent = "Correct !";
        resultMessage.className = "result-message correct";
    } else {
        resultMessage.textContent = "Incorrect !";
        resultMessage.className = "result-message incorrect";
    }

    usedWords.push(currentWord.mot);
    localStorage.setItem('fomot_used_words', JSON.stringify(usedWords));
    localStorage.setItem('fomot_score', score.toString());

    updateScoreDisplay();
    updateHistoryUI();

    resultMessage.classList.remove('hidden');
    buttonsContainer.classList.add('hidden');
    
    descriptionText.innerHTML = currentWord.correctDefinition;
    descriptionBox.classList.remove('hidden');

    if (currentWord.source && currentWord.sourceUrl) {
        sourceLink.textContent = currentWord.source;
        sourceLink.href = currentWord.sourceUrl;
        sourceDisplay.classList.remove('hidden');
    }
}

if (btnToggleMenu && historySidebar) {
    btnToggleMenu.addEventListener('click', () => {
        historySidebar.classList.toggle('open');
    });
}

btnStart.addEventListener('click', startGame);
btnNext.addEventListener('click', showNextWord);

loadWords();