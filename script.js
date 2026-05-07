class SudokuGame {
    constructor() {
        this.board = [];
        this.solution = [];
        this.selectedCell = null;
        this.selectedNumber = null;
        this.moves = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.fixedCells = new Set();
        
        this.init();
    }

    init() {
        this.createBoard();
        this.setupEventListeners();
        this.startNewGame();
        this.startTimer();
    }

    createBoard() {
        const boardElement = document.getElementById('sudoku-board');
        boardElement.innerHTML = '';
        
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;
            cell.dataset.row = Math.floor(i / 4);
            cell.dataset.col = i % 4;
            boardElement.appendChild(cell);
        }
    }

    setupEventListeners() {
        // Cell clicks
        document.getElementById('sudoku-board').addEventListener('click', (e) => {
            if (e.target.classList.contains('cell') && !e.target.classList.contains('fixed')) {
                this.selectCell(e.target);
            }
        });

        // Number buttons
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const number = parseInt(btn.dataset.number);
                this.selectNumber(number);
                this.highlightNumberButton(btn);
            });
        });

        // Control buttons
        document.getElementById('new-game').addEventListener('click', () => this.startNewGame());
        document.getElementById('hint').addEventListener('click', () => this.giveHint());
        document.getElementById('check').addEventListener('click', () => this.checkSolution());
        document.getElementById('reset').addEventListener('click', () => this.resetGame());

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '4') {
                this.selectNumber(parseInt(e.key));
                const btn = document.querySelector(`.number-btn[data-number="${e.key}"]`);
                this.highlightNumberButton(btn);
            } else if (e.key === '0' || e.key === 'Delete' || e.key === 'Backspace') {
                this.selectNumber(0);
                const btn = document.querySelector('.clear-btn');
                this.highlightNumberButton(btn);
            }
        });
    }

    startNewGame() {
        this.moves = 0;
        this.timer = 0;
        this.updateMoves();
        this.updateTimer();
        this.fixedCells.clear();
        
        // Generate a valid Sudoku solution
        this.solution = this.generateSolution();
        
        // Create puzzle by removing numbers
        this.board = this.createPuzzle(this.solution);
        
        // Update the display
        this.updateBoard();
        this.showMessage('لعبة جديدة! املأ المربعات الفارغة', 'info');
    }

    generateSolution() {
        // Start with a valid base solution
        const base = [
            [1, 2, 3, 4],
            [3, 4, 1, 2],
            [2, 1, 4, 3],
            [4, 3, 2, 1]
        ];
        
        // Shuffle rows and columns within blocks
        const solution = this.shuffleSolution(base);
        return solution;
    }

    shuffleSolution(base) {
        const solution = base.map(row => [...row]);
        
        // Shuffle rows within each 2-row block
        for (let block = 0; block < 2; block++) {
            if (Math.random() > 0.5) {
                const row1 = block * 2;
                const row2 = block * 2 + 1;
                [solution[row1], solution[row2]] = [solution[row2], solution[row1]];
            }
        }
        
        // Shuffle columns within each 2-column block
        for (let block = 0; block < 2; block++) {
            if (Math.random() > 0.5) {
                const col1 = block * 2;
                const col2 = block * 2 + 1;
                for (let row = 0; row < 4; row++) {
                    [solution[row][col1], solution[row][col2]] = [solution[row][col2], solution[row][col1]];
                }
            }
        }
        
        // Swap 2-row blocks
        if (Math.random() > 0.5) {
            [solution[0], solution[0]] = [solution[0], solution[0]];
            [solution[1], solution[2]] = [solution[2], solution[1]];
        }
        
        // Swap 2-column blocks
        if (Math.random() > 0.5) {
            for (let row = 0; row < 4; row++) {
                [solution[row][0], solution[row][2]] = [solution[row][2], solution[row][0]];
                [solution[row][1], solution[row][3]] = [solution[row][3], solution[row][1]];
            }
        }
        
        return solution;
    }

    createPuzzle(solution) {
        const puzzle = solution.map(row => [...row]);
        const cellsToRemove = 6 + Math.floor(Math.random() * 4); // Remove 6-9 numbers
        
        const positions = [];
        for (let i = 0; i < 16; i++) {
            positions.push(i);
        }
        
        // Shuffle positions
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }
        
        // Remove numbers from random positions
        for (let i = 0; i < cellsToRemove; i++) {
            const pos = positions[i];
            const row = Math.floor(pos / 4);
            const col = pos % 4;
            puzzle[row][col] = 0;
        }
        
        // Mark fixed cells
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (puzzle[row][col] !== 0) {
                    this.fixedCells.add(row * 4 + col);
                }
            }
        }
        
        return puzzle;
    }

    updateBoard() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 4);
            const col = index % 4;
            const value = this.board[row][col];
            
            cell.textContent = value || '';
            cell.classList.remove('fixed', 'error', 'correct', 'hint');
            
            if (this.fixedCells.has(index)) {
                cell.classList.add('fixed');
            }
        });
    }

    selectCell(cell) {
        // Remove previous selection
        document.querySelectorAll('.cell').forEach(c => c.classList.remove('selected'));
        
        // Select new cell
        cell.classList.add('selected');
        this.selectedCell = cell;
        
        // If we have a selected number, place it
        if (this.selectedNumber !== null) {
            this.placeNumber();
        }
    }

    selectNumber(number) {
        this.selectedNumber = number;
        
        // If we have a selected cell, place the number
        if (this.selectedCell) {
            this.placeNumber();
        }
    }

    placeNumber() {
        if (!this.selectedCell || this.selectedCell.classList.contains('fixed')) {
            return;
        }
        
        const index = parseInt(this.selectedCell.dataset.index);
        const row = Math.floor(index / 4);
        const col = index % 4;
        
        // Clear previous error/correct states
        this.selectedCell.classList.remove('error', 'correct');
        
        if (this.selectedNumber === 0) {
            // Clear the cell
            this.board[row][col] = 0;
            this.selectedCell.textContent = '';
        } else {
            // Place the number
            this.board[row][col] = this.selectedNumber;
            this.selectedCell.textContent = this.selectedNumber;
            
            // Check if the placement is correct
            if (this.selectedNumber === this.solution[row][col]) {
                this.selectedCell.classList.add('correct');
                setTimeout(() => {
                    this.selectedCell.classList.remove('correct');
                }, 1000);
            } else {
                this.selectedCell.classList.add('error');
                setTimeout(() => {
                    this.selectedCell.classList.remove('error');
                }, 1000);
            }
        }
        
        this.moves++;
        this.updateMoves();
        
        // Check if game is complete
        if (this.isGameComplete()) {
            this.gameWon();
        }
    }

    highlightNumberButton(btn) {
        document.querySelectorAll('.number-btn').forEach(b => b.classList.remove('active'));
        if (btn) {
            btn.classList.add('active');
        }
    }

    giveHint() {
        const emptyCells = [];
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (this.board[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }
        
        if (emptyCells.length === 0) {
            this.showMessage('لا توجد مربعات فارغة!', 'info');
            return;
        }
        
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const { row, col } = randomCell;
        const index = row * 4 + col;
        const cell = document.querySelector(`.cell[data-index="${index}"]`);
        
        this.board[row][col] = this.solution[row][col];
        cell.textContent = this.solution[row][col];
        cell.classList.add('hint');
        
        setTimeout(() => {
            cell.classList.remove('hint');
        }, 2000);
        
        this.moves++;
        this.updateMoves();
        
        this.showMessage('تم إعطاء مساعدة!', 'success');
        
        if (this.isGameComplete()) {
            this.gameWon();
        }
    }

    checkSolution() {
        let hasErrors = false;
        const cells = document.querySelectorAll('.cell');
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const index = row * 4 + col;
                const cell = cells[index];
                
                if (this.board[row][col] !== 0 && this.board[row][col] !== this.solution[row][col]) {
                    cell.classList.add('error');
                    hasErrors = true;
                }
            }
        }
        
        if (hasErrors) {
            this.showMessage('هناك أخطاء في الحل! المربعات الحمراء غير صحيحة', 'error');
        } else if (this.isGameComplete()) {
            this.gameWon();
        } else {
            this.showMessage('الحل صحيح حتى الآن! استمر في اللعب', 'success');
        }
    }

    resetGame() {
        // Reset to the initial puzzle state
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (!this.fixedCells.has(row * 4 + col)) {
                    this.board[row][col] = 0;
                }
            }
        }
        
        this.moves = 0;
        this.updateMoves();
        this.updateBoard();
        this.showMessage('تم إعادة تعيين اللعبة!', 'info');
    }

    isGameComplete() {
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (this.board[row][col] !== this.solution[row][col]) {
                    return false;
                }
            }
        }
        return true;
    }

    gameWon() {
        this.stopTimer();
        this.showMessage(`🎉 مبروك! لقد فزت في ${this.moves} حركة و ${this.formatTime(this.timer)}!`, 'success');
        
        // Add celebration animation
        document.querySelectorAll('.cell').forEach((cell, index) => {
            setTimeout(() => {
                cell.classList.add('correct');
                setTimeout(() => {
                    cell.classList.remove('correct');
                }, 500);
            }, index * 50);
        });
    }

    startTimer() {
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimer();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimer() {
        document.getElementById('timer').textContent = this.formatTime(this.timer);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    updateMoves() {
        document.getElementById('moves').textContent = this.moves;
    }

    showMessage(text, type) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = text;
        messageElement.className = `message ${type} show`;
        
        setTimeout(() => {
            messageElement.classList.remove('show');
        }, 3000);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SudokuGame();
});
