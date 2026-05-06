class Sudoku4x4 {
    constructor() {
        this.board = [];
        this.solution = [];
        this.initialBoard = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createNewGame();
    }

    setupEventListeners() {
        document.getElementById('newGame').addEventListener('click', () => this.createNewGame());
        document.getElementById('checkSolution').addEventListener('click', () => this.checkSolution());
        document.getElementById('showSolution').addEventListener('click', () => this.showSolution());
    }

    createBoard() {
        const boardElement = document.getElementById('sudokuBoard');
        boardElement.innerHTML = '';

        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;
            
            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            input.min = 1;
            input.max = 4;
            
            input.addEventListener('input', (e) => this.handleInput(e, i));
            input.addEventListener('focus', (e) => this.handleFocus(e, i));
            input.addEventListener('keydown', (e) => this.handleKeydown(e, i));
            
            cell.appendChild(input);
            boardElement.appendChild(cell);
        }
    }

    handleInput(e, index) {
        const value = e.target.value;
        
        if (value && (!/^[1-4]$/.test(value))) {
            e.target.value = '';
            return;
        }
        
        this.board[index] = value ? parseInt(value) : 0;
        this.clearHighlights();
        this.checkWin();
    }

    handleFocus(e, index) {
        this.clearHighlights();
        e.target.parentElement.classList.add('selected');
        this.highlightRelatedCells(index);
    }

    handleKeydown(e, index) {
        const key = e.key;
        let newIndex = index;

        switch(key) {
            case 'ArrowUp':
                newIndex = index - 4;
                break;
            case 'ArrowDown':
                newIndex = index + 4;
                break;
            case 'ArrowLeft':
                newIndex = index - 1;
                break;
            case 'ArrowRight':
                newIndex = index + 1;
                break;
            default:
                return;
        }

        if (newIndex >= 0 && newIndex < 16) {
            e.preventDefault();
            const cells = document.querySelectorAll('.cell input');
            cells[newIndex].focus();
        }
    }

    highlightRelatedCells(index) {
        const row = Math.floor(index / 4);
        const col = index % 4;
        const boxRow = Math.floor(row / 2);
        const boxCol = Math.floor(col / 2);

        for (let i = 0; i < 16; i++) {
            const currentRow = Math.floor(i / 4);
            const currentCol = i % 4;
            const currentBoxRow = Math.floor(currentRow / 2);
            const currentBoxCol = Math.floor(currentCol / 2);

            if (currentRow === row || currentCol === col || 
                (currentBoxRow === boxRow && currentBoxCol === boxCol)) {
                document.querySelector(`[data-index="${i}"]`).classList.add('selected');
            }
        }
    }

    clearHighlights() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('selected', 'error', 'correct');
        });
    }

    generateSolution() {
        const solution = new Array(16).fill(0);
        
        const numbers = [1, 2, 3, 4];
        this.shuffleArray(numbers);
        
        for (let i = 0; i < 4; i++) {
            solution[i] = numbers[i];
        }
        
        this.solveSudoku(solution, 0);
        return solution;
    }

    solveSudoku(board, index) {
        if (index === 16) return true;
        
        if (board[index] !== 0) {
            return this.solveSudoku(board, index + 1);
        }
        
        const numbers = [1, 2, 3, 4];
        this.shuffleArray(numbers);
        
        for (const num of numbers) {
            if (this.isValidMove(board, index, num)) {
                board[index] = num;
                
                if (this.solveSudoku(board, index + 1)) {
                    return true;
                }
                
                board[index] = 0;
            }
        }
        
        return false;
    }

    isValidMove(board, index, num) {
        const row = Math.floor(index / 4);
        const col = index % 4;
        
        for (let i = 0; i < 4; i++) {
            if (board[row * 4 + i] === num) return false;
            if (board[i * 4 + col] === num) return false;
        }
        
        const boxRow = Math.floor(row / 2) * 2;
        const boxCol = Math.floor(col / 2) * 2;
        
        for (let i = boxRow; i < boxRow + 2; i++) {
            for (let j = boxCol; j < boxCol + 2; j++) {
                if (board[i * 4 + j] === num) return false;
            }
        }
        
        return true;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    createPuzzle(solution) {
        const puzzle = [...solution];
        const cellsToRemove = 8 + Math.floor(Math.random() * 3);
        
        const indices = [];
        for (let i = 0; i < 16; i++) {
            indices.push(i);
        }
        this.shuffleArray(indices);
        
        for (let i = 0; i < cellsToRemove; i++) {
            puzzle[indices[i]] = 0;
        }
        
        return puzzle;
    }

    createNewGame() {
        this.createBoard();
        this.solution = this.generateSolution();
        this.initialBoard = this.createPuzzle(this.solution);
        this.board = [...this.initialBoard];
        
        this.renderBoard();
        this.showMessage('لعبة جديدة! املأ الخلايا الفارغة.', 'info');
    }

    renderBoard() {
        const cells = document.querySelectorAll('.cell input');
        
        cells.forEach((input, index) => {
            const value = this.board[index];
            const cell = input.parentElement;
            
            if (value !== 0) {
                input.value = value;
                input.readOnly = true;
                cell.classList.add('fixed');
            } else {
                input.value = '';
                input.readOnly = false;
                cell.classList.remove('fixed');
            }
        });
    }

    checkSolution() {
        let hasErrors = false;
        const cells = document.querySelectorAll('.cell');
        
        cells.forEach((cell, index) => {
            if (this.board[index] !== 0) {
                if (this.board[index] === this.solution[index]) {
                    cell.classList.add('correct');
                } else {
                    cell.classList.add('error');
                    hasErrors = true;
                }
            }
        });
        
        if (hasErrors) {
            this.showMessage('هناك أخطاء! الخلايا الحمراء تحتوي على إجابات خاطئة.', 'error');
        } else {
            this.showMessage('جميع الإجابات صحيحة حتى الآن! استمر في العمل.', 'success');
        }
        
        setTimeout(() => this.clearHighlights(), 3000);
    }

    showSolution() {
        this.board = [...this.solution];
        this.renderBoard();
        this.showMessage('تم إظهار الحل الكامل!', 'info');
    }

    checkWin() {
        for (let i = 0; i < 16; i++) {
            if (this.board[i] === 0 || this.board[i] !== this.solution[i]) {
                return false;
            }
        }
        
        this.showMessage('🎉 مبروك! لقد حلقت اللعبة بنجاح!', 'success');
        this.disableAllInputs();
        return true;
    }

    disableAllInputs() {
        const inputs = document.querySelectorAll('.cell input');
        inputs.forEach(input => {
            input.readOnly = true;
        });
    }

    showMessage(text, type) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = text;
        messageElement.className = `message ${type}`;
        
        if (type !== 'success') {
            setTimeout(() => {
                messageElement.textContent = '';
                messageElement.className = 'message';
            }, 3000);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Sudoku4x4();
});
