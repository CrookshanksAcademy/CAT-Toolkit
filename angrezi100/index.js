  // Load settings from local storage
  function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('quizSettings')) || {};

    // Apply font size
    if (settings.fontSize) {
        setFontSize(settings.fontSize);
        document.querySelectorAll('.font-size-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.size === settings.fontSize) {
                btn.classList.add('active');
            }
        });
    }

    // Apply dark mode
    if (settings.darkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('dark-mode-toggle').checked = true;
    }
}

// Save settings to local storage
function saveSettings() {
    const fontSize = document.querySelector('.font-size-btn.active').dataset.size;
    const darkMode = document.getElementById('dark-mode-toggle').checked;

    localStorage.setItem('quizSettings', JSON.stringify({
        fontSize,
        darkMode
    }));

    // Apply settings immediately
    setFontSize(fontSize);
    if (darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// Set font size by adding class to body
function setFontSize(size) {
    // Remove all font size classes first
    document.body.classList.remove('font-small', 'font-medium', 'font-large');

    // Add the selected class
    document.body.classList.add(`font-${size}`);
}

// Reset the test
function resetTest() {
    // Clear user answers
    userAnswers = {};
    quizCompleted = false;

    // Reset UI
    document.querySelectorAll('.option').forEach(option => {
        option.classList.remove('selected', 'correct', 'incorrect');
    });

    // Hide explanations
    document.querySelectorAll('.explanation').forEach(exp => {
        exp.style.display = 'none';
        exp.classList.remove('show');
        exp.querySelector('.explanation-toggle').textContent = '+';
    });

    document.getElementById('result-container').style.display = 'none';
    document.getElementById('submit-btn').disabled = true;

    // Restart timer
    stopTimer();
    startTimer();

    // Save to storage
    saveProgress();

    // Close modal if open
    document.getElementById('settings-modal').style.display = 'none';
}

// Start timer
function startTimer() {
    startTime = new Date();
    saveProgress();
    timerInterval = setInterval(updateTimer, 1000);
}

// Update timer display
function updateTimer() {
    if (!startTime || quizCompleted) return;

    const now = new Date();
    const diff = Math.floor((now - startTime) / 1000);
    const minutes = Math.floor(diff / 60).toString().padStart(2, '0');
    const seconds = (diff % 60).toString().padStart(2, '0');

    document.getElementById('timer').textContent = `${minutes}:${seconds}`;
}

// Stop timer
function stopTimer() {
    clearInterval(timerInterval);
}

// Check if all questions are answered
function checkSubmitButton() {
    const answeredCount = Object.keys(userAnswers).length;
    document.getElementById('submit-btn').disabled = answeredCount < 4;
}

// Calculate score
function calculateScore() {
    let score = 0;
    Object.keys(userAnswers).forEach(question => {
        if (userAnswers[question] == quizData[question].correct) {
            score += 3;
        } else {
            score -= 1;
        }
    });
    return Math.max(0, score); // Ensure score doesn't go below 0
}

// Highlight correct/incorrect answers
function highlightAnswers() {
    Object.keys(userAnswers).forEach(question => {
        const userAnswer = userAnswers[question];
        const correctAnswer = quizData[question].correct;

        // Highlight user's answer
        const userOption = document.querySelector(`.option[data-question="${question}"][data-option="${userAnswer}"]`);
        if (userOption) {
            if (userAnswer === correctAnswer) {
                userOption.classList.add('correct');
            } else {
                userOption.classList.add('incorrect');
            }
        }

        // Highlight correct answer if user was wrong
        if (userAnswer !== correctAnswer) {
            const correctOption = document.querySelector(`.option[data-question="${question}"][data-option="${correctAnswer}"]`);
            if (correctOption) {
                correctOption.classList.add('correct');
            }
        }
    });
}

// Show results
function showResults() {
    const score = calculateScore();
    const timeTaken = document.getElementById('timer').textContent;
    
    // Store the time taken in local storage
    const storageKey = getStorageKey();
    const savedData = JSON.parse(localStorage.getItem(storageKey)) || {};
    savedData.timeTaken = timeTaken;
    localStorage.setItem(storageKey, JSON.stringify(savedData));

    document.getElementById('score').textContent = `Score: ${score}/12`;
    document.getElementById('time-taken').textContent = `Time taken: ${timeTaken}`;

    // Simple review based on score
    let review = '';
    if (score >= 10) {
        review = 'Excellent! You have a strong understanding of this topic.';
    } else if (score >= 6) {
        review = 'Good job! You have a decent grasp of the concepts.';
    } else {
        review = 'Keep practicing! Review the explanations and try again.';
    }

    document.getElementById('review').textContent = review;
    document.getElementById('result-container').style.display = 'block';

    // Show all explanations
    document.querySelectorAll('.explanation').forEach(exp => {
        exp.style.display = 'block';
    });
}

// Save to local storage
function saveProgress() {
    const storageKey = getStorageKey();
    localStorage.setItem(storageKey, JSON.stringify({
        startTime: startTime,
        answers: userAnswers,
        completed: quizCompleted
    }));
}

// Double click to define word
function setupDoubleClickDefine() {
    const articleContent = document.getElementById('article-content');
    articleContent.addEventListener('dblclick', function (e) {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (selectedText.length > 0) {
            window.open(`https://www.google.com/search?q=define+${encodeURIComponent(selectedText)}`, '_blank');
        }
    });
}

// Toggle explanation visibility
function setupExplanationToggles() {
    document.querySelectorAll('.explanation-header').forEach(header => {
        header.addEventListener('click', function() {
            const explanation = this.parentElement;
            const content = explanation.querySelector('.explanation-content');
            const toggle = explanation.querySelector('.explanation-toggle');
            
            if (explanation.classList.contains('show')) {
                explanation.classList.remove('show');
                content.style.display = 'none';
                toggle.textContent = '+';
            } else {
                explanation.classList.add('show');
                content.style.display = 'block';
                toggle.textContent = '-';
            }
        });
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
    initializeFromStorage();
    setupDoubleClickDefine();
    setupExplanationToggles();

    // Option selection
    document.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', function () {
            if (quizCompleted) return;

            const question = this.dataset.question;
            const optionNum = this.dataset.option;

            // Remove selected class from other options in this question
            document.querySelectorAll(`.option[data-question="${question}"]`).forEach(opt => {
                opt.classList.remove('selected');
            });

            // Add selected class to clicked option
            this.classList.add('selected');

            // Store answer
            userAnswers[question] = parseInt(optionNum);

            // Update storage and check submit button
            saveProgress();
            checkSubmitButton();
        });
    });

    // Submit button
    document.getElementById('submit-btn').addEventListener('click', function () {
        if (quizCompleted) return;

        quizCompleted = true;
        stopTimer();
        highlightAnswers();
        showResults();
        saveProgress();
    });

    // Back button
    document.querySelector('.back-button').addEventListener('click', function () {
        window.location.href = "https://cat.crookshanksacademy.com/angrezi100.html"
    });

    // Timer click to restart test
    document.getElementById('timer').addEventListener('click', function () {
        resetTest();
    });

    // Settings icon click
    document.getElementById('settings-icon').addEventListener('click', function () {
        document.getElementById('settings-modal').style.display = 'flex';
    });

    // Close modal
    document.getElementById('close-modal').addEventListener('click', function () {
        document.getElementById('settings-modal').style.display = 'none';
    });

    // Font size buttons
    document.querySelectorAll('.font-size-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.font-size-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Save settings
    document.getElementById('save-settings-btn').addEventListener('click', function () {
        saveSettings();
        document.getElementById('settings-modal').style.display = 'none';
    });

    // Reset test button
    document.getElementById('reset-test-btn').addEventListener('click', function () {
        if (confirm('Are you sure you want to reset the test? All your progress will be lost.')) {
            resetTest();
        }
    });

    // Close modal when clicking outside
    window.addEventListener('click', function (e) {
        if (e.target === document.getElementById('settings-modal')) {
            document.getElementById('settings-modal').style.display = 'none';
        }
    });
});

        // Timer variables
        let startTime;
        let timerInterval;
        let quizCompleted = false;

        // User answers
        let userAnswers = {};

        // Initialize from local storage
        function initializeFromStorage() {
            const storageKey = getStorageKey();
            const savedData = localStorage.getItem(storageKey);
            if (savedData) {
                const data = JSON.parse(savedData);
                userAnswers = data.answers || {};
                quizCompleted = data.completed || false;

                // Restore time taken if quiz was completed
                if (quizCompleted && data.timeTaken) {
                    document.getElementById('time-taken').textContent = `Time taken: ${data.timeTaken}`;
                }

                // Restore selected answers
                Object.keys(userAnswers).forEach(question => {
                    const option = document.querySelector(`.option[data-question="${question}"][data-option="${userAnswers[question]}"]`);
                    if (option) {
                        option.classList.add('selected');
                    }
                });

                // If quiz was completed, show results
                if (quizCompleted) {
                    showResults();
                    highlightAnswers();
                    stopTimer();
                } else {
                    // Restore timer if quiz wasn't completed
                    if (data.startTime) {
                        startTime = new Date(data.startTime);
                        startTimer();
                    } else {
                        startTimer();
                    }
                }

                // Enable submit button if all questions answered
                checkSubmitButton();
            } else {
                startTimer();
            }

            // Load settings
            loadSettings();
        }
         // Generate a unique storage key based on the page URL
         function getStorageKey() {
            const path = window.location.pathname.replace(/\//g, '_');
            return `quizProgress_${path}`;
        }
