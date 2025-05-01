document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const flashcard = document.querySelector('.flashcard');
    const flashcardFront = document.querySelector('.flashcard-front');
    const flashcardBack = document.querySelector('.flashcard-back');
    const progressDisplay = document.querySelector('.progress');
    const correctBtn = document.querySelector('.correct-btn');
    const incorrectBtn = document.querySelector('.incorrect-btn');
    const settingsBtn = document.querySelector('.settings-btn');
    const settingsModal = document.querySelector('.settings-modal');
    const closeModal = document.querySelector('.close-modal');
    const themeOptions = document.querySelectorAll('input[name="theme"]');
    const resetBtn = document.querySelector('.reset-btn');
    const completionModal = document.querySelector('.completion-modal');
    const resetCompletedBtn = document.querySelector('.reset-completed-btn');
    
    // Flashcard data
    const totalFlashcards = 200;
    let flashcards = [];
    let masteredFlashcards = [];
    let currentFlashcardIndex = 0;
    let masteredCount = 0;
    
    // Update theme colors
    function updateThemeColors(theme) {
        const buttons = document.querySelectorAll('.correct-btn, .incorrect-btn, .reset-btn, .reset-completed-btn');
        const svgs = document.querySelectorAll('.correct-btn svg, .incorrect-btn svg, .close-modal svg, .settings-btn svg');
        
        if (theme === 'dark') {
            buttons.forEach(btn => btn.style.color = 'white');
            svgs.forEach(svg => svg.style.stroke = 'white');
        } else {
            buttons.forEach(btn => btn.style.color = 'black');
            svgs.forEach(svg => svg.style.stroke = 'black');
        }
    }
    
    // Initialize flashcards
    function initializeFlashcards() {
        flashcards = [];
        masteredFlashcards = [];
        for (let i = 1; i <= totalFlashcards; i++) {
            flashcards.push({
                id: i,
                question: `https://picsum.photos/800/450?random=${i}&q=1`,
                answer: `https://picsum.photos/800/450?random=${i}&a=1`,
            });
        }
        currentFlashcardIndex = 0;
        masteredCount = 0;
        updateProgress();
        loadCurrentFlashcard();
    }
    
    // Load current flashcard
    function loadCurrentFlashcard() {
        if (flashcards.length === 0) {
            showCompletionModal();
            return;
        }
        
        // If we've reached the end of current deck, reset index
        if (currentFlashcardIndex >= flashcards.length) {
            currentFlashcardIndex = 0;
        }
        
        const currentCard = flashcards[currentFlashcardIndex];
        const frontImg = flashcardFront.querySelector('.flashcard-image');
        const backImg = flashcardBack.querySelector('.flashcard-image');
        
        // Reset image sources for lazy loading
        frontImg.src = '';
        backImg.src = '';
        frontImg.dataset.src = currentCard.question;
        backImg.dataset.src = currentCard.answer;
        
        // Load front image
        const frontObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && frontImg.dataset.src) {
                frontImg.src = frontImg.dataset.src;
                frontObserver.unobserve(frontImg);
            }
        }, { threshold: 0.1 });
        
        frontObserver.observe(frontImg);
        
        // Load back image when card is flipped
        const backObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && backImg.dataset.src) {
                backImg.src = backImg.dataset.src;
                backObserver.unobserve(backImg);
            }
        }, { threshold: 0.1, root: flashcard });
        
        backObserver.observe(backImg);
        
        // Reset card state
        flashcard.classList.remove('flipped');
    }
    
    // Update progress display
    function updateProgress() {
        progressDisplay.textContent = `${masteredCount}/${totalFlashcards}`;
    }
    
    // Handle correct answer
    function handleCorrect() {
        // Move current card to mastered list
        const masteredCard = flashcards.splice(currentFlashcardIndex, 1)[0];
        masteredFlashcards.push(masteredCard);
        masteredCount++;
        
        updateProgress();
        
        if (flashcards.length === 0) {
            showCompletionModal();
        } else {
            // Don't increment index since we removed current card
            loadCurrentFlashcard();
        }
    }
    
    // Handle incorrect answer
    function handleIncorrect() {
        // Move current card to end of array
        const incorrectCard = flashcards.splice(currentFlashcardIndex, 1)[0];
        flashcards.push(incorrectCard);
        
        // Don't increment index since we moved current card to end
        loadCurrentFlashcard();
    }
    
    // Show completion modal (non-dismissable)
    function showCompletionModal() {
        completionModal.style.display = 'flex';
        // Hide the flashcard and buttons
        document.querySelector('.flashcard-container').style.display = 'none';
    }
    
    // Event listeners
    flashcard.addEventListener('click', function() {
        if (!flashcard.classList.contains('flipped') && flashcards.length > 0) {
            flashcard.classList.add('flipped');
        }
    });
    
    correctBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (flashcards.length > 0) {
            handleCorrect();
        }
    });
    
    incorrectBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (flashcards.length > 0) {
            handleIncorrect();
        }
    });
    
    settingsBtn.addEventListener('click', function() {
        settingsModal.style.display = 'flex';
    });
    
    closeModal.addEventListener('click', function() {
        settingsModal.style.display = 'none';
    });
    
    resetBtn.addEventListener('click', function() {
        initializeFlashcards();
        settingsModal.style.display = 'none';
        // Show the flashcard and buttons again
        document.querySelector('.flashcard-container').style.display = 'block';
        completionModal.style.display = 'none';
    });
    
    resetCompletedBtn.addEventListener('click', function() {
        initializeFlashcards();
        // Show the flashcard and buttons again
        document.querySelector('.flashcard-container').style.display = 'block';
        completionModal.style.display = 'none';
    });
    
    // Theme switcher
    themeOptions.forEach(option => {
        option.addEventListener('change', function() {
            const theme = this.value;
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            updateThemeColors(theme);
        });
    });
    
    // Close settings modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
        // Don't allow closing completion modal by clicking outside
    });
    
    // Initialize
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    document.querySelector(`input[name="theme"][value="${savedTheme}"]`).checked = true;
    updateThemeColors(savedTheme);
    
    initializeFlashcards();
    
    // Intersection Observer polyfill
    window.IntersectionObserver = window.IntersectionObserver || function(callback) {
        return {
            observe: (target) => {
                const img = target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
            },
            unobserve: () => {}
        };
    };
});