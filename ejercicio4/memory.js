class Card {
    constructor(name, img) {
        this.name = name;
        this.img = img;
        this.isFlipped = false;
        this.element = this.#createCardElement();
    }

    #createCardElement() {
        const cardElement = document.createElement("div");
        cardElement.classList.add("cell");
        cardElement.innerHTML = `
          <div class="card" data-name="${this.name}">
              <div class="card-inner">
                  <div class="card-front"></div>
                  <div class="card-back">
                      <img src="${this.img}" alt="${this.name}">
                  </div>
              </div>
          </div>
      `;
        return cardElement;
    }

    toggleFlip() {
        if (this.isFlipped) {
            this.unflip();
        } else {
            this.flip();
        }
    }

    flip() {
        this.isFlipped = true;
        this.element.querySelector(".card").classList.add("flipped");
    }

    unflip() {
        this.isFlipped = false;
        this.element.querySelector(".card").classList.remove("flipped");
    }

    matches(otherCard) {
        return this.name === otherCard.name;
    }
}

class Board {
    constructor(cards) {
        this.cards = cards;
        this.fixedGridElement = document.querySelector(".fixed-grid");
        this.gameBoardElement = document.getElementById("game-board");
    }

    shuffleCards() {
        this.cards.sort(() => Math.random() - 0.5);
    }

    flipDownAllCards() {
        this.cards.forEach(card => card.unflip());
    }

    reset() {
        this.shuffleCards();
        this.flipDownAllCards();
        this.setGridColumns();
        this.render();
    }

    setGridColumns() {
        const columns = this.calculateColumns();
        this.gameBoardElement.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    }

    calculateColumns() {
        return Math.floor(Math.sqrt(this.cards.length));
    }

    render() {
        this.gameBoardElement.innerHTML = "";
        this.cards.forEach(card => {
            card.element
                .querySelector(".card")
                .addEventListener("click", () => this.onCardClicked(card));
            this.gameBoardElement.appendChild(card.element);
        });
    }

    onCardClicked(card) {
        if (this.onCardClick) {
            this.onCardClick(card);
        }
    }
}

class MemoryGame {
    constructor(board, flipDuration = 500) {
        this.board = board;
        this.flippedCards = [];
        this.matchedCards = [];
        this.moves = 0;
        this.timer = null;
        this.timeElapsed = 0;
        this.startTime = null;
        this.flipDuration = Math.max(350, Math.min(flipDuration, 3000));
        this.board.onCardClick = this.#handleCardClick.bind(this);
        this.board.reset();
        this.updateMoveCounter();
        this.updateTimerDisplay();
    }

    #handleCardClick(card) {
        if (this.flippedCards.length < 2 && !card.isFlipped) {
            if (!this.startTime) {
                this.startTimer();
            }
            card.toggleFlip();
            this.flippedCards.push(card);

            if (this.flippedCards.length === 2) {
                this.moves++;
                this.updateMoveCounter();
                setTimeout(() => this.checkForMatch(), this.flipDuration);
            }
        }
    }

    checkForMatch() {
        const [card1, card2] = this.flippedCards;
        if (card1.matches(card2)) {
            this.matchedCards.push(card1, card2);
            if (this.matchedCards.length === this.board.cards.length) {
                this.stopTimer();
                this.calculateScore();
            }
        } else {
            card1.toggleFlip();
            card2.toggleFlip();
        }
        this.flippedCards = [];
    }

    resetGame() {
        this.matchedCards = [];
        this.flippedCards = [];
        this.moves = 0;
        this.timeElapsed = 0;
        this.startTime = null;
        this.stopTimer();
        this.board.reset();
        this.updateMoveCounter();
        this.updateTimerDisplay();
    }

    updateMoveCounter() {
        const moveCounterElement = document.getElementById("move-counter");
        if (moveCounterElement) {
            moveCounterElement.textContent = `Movimientos: ${this.moves}`;
        }
    }

    updateTimerDisplay() {
        const timerElement = document.getElementById("timer");
        if (timerElement) {
            const minutes = Math.floor(this.timeElapsed / 60);
            const seconds = this.timeElapsed % 60;
            timerElement.textContent = `Tiempo: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
    }

    startTimer() {
        this.startTime = Date.now();
        this.timer = setInterval(() => {
            this.timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
            this.updateTimerDisplay();
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    calculateScore() {
        const score = Math.max(0, 10000 - (this.timeElapsed * 10 + this.moves * 100));
        alert(`Juego completado! Puntuación: ${score}`);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const cardsData = [
        { name: "Python", img: "./img/Python.svg" },
        { name: "JavaScript", img: "./img/JS.svg" },
        { name: "Java", img: "./img/Java.svg" },
        { name: "CSharp", img: "./img/CSharp.svg" },
        { name: "Go", img: "./img/Go.svg" },
        { name: "Ruby", img: "./img/Ruby.svg" },
    ];

    const cards = cardsData.flatMap((data) => [
        new Card(data.name, data.img),
        new Card(data.name, data.img),
    ]);
    const board = new Board(cards);
    const memoryGame = new MemoryGame(board, 1000);

    document.getElementById("restart-button").addEventListener("click", () => {
        memoryGame.resetGame();
    });
});
