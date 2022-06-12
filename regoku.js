var game = (function () {

    var board;

    class Cell {
        constructor(size) {
            this.done = false;
            //digit = null;
            this.candidates = new Set();

            for (var d = 0; d < size; d++) {
                this.candidates.add(d + 1);
            }
        }
    }

    class Board {
        constructor(size) {
            if (size < 1) {
                console.log("Error, grid must be at least 1x1");
            }

            this.size = size;

            this.cells = new Array(size);

            for (var r = 0; r < size; r++) {
                this.cells[r] = new Array(size);

                for (var c = 0; c < size; c++) {
                    this.cells[r][c] = new Cell(size);
                }
            }

            this.setDigit = function (r, c, d) {
                if (this.cells[r][c].done) {
                    console.log("**Overwrite** Cell[" + (r + 1) + "][" + (c + 1) + "]" + this.cells[r][c].digit + "<-" + d);
                } else {
                    console.log("Cell[" + (r + 1) + "][" + (c + 1) + "]=" + d);
                }

                this.cells[r][c].digit = d;
                this.cells[r][c].candidates.clear();
                this.cells[r][c].done = true;
            };

            this.eliminate = function (y, x, digit) {
                var changed = false;

                for (var r = 0; r < this.size; r++) {
                    for (var c = 0; c < this.size; c++) {
                        // Are we looking at (same row, but different column) or (different row, but same column) ?
                        // ...or same box?
                        //Same box if when row,col divide by 3 (integer divide) is same as the source cell
                        if (
                            (r == y && c != x) ||
                            (r != y && c == x)
                            || (Math.floor(r / 3) == Math.floor(y / 3) && Math.floor(c / 3) == Math.floor(x / 3))
                        ) {
                            if (this.cells[r][c].candidates.has(digit)) {

                                if (r == 8 && c == 0) {
                                    // console.log(`Elim ${digit} from [${r + 1},${c + 1}] source[${y + 1},${x + 1}]`);
                                }
                                this.cells[r][c].candidates.delete(digit);

                                changed = true;
                            }
                        }
                    }
                }
            }


            /*
                          1|29e cec e15 
            sudoku.js:116 2|8dc 172 dd6 
            sudoku.js:116 3|eff dgd gef 
            sudoku.js:119   --- --- --- 
            sudoku.js:116 4|1ef eed ggd 
            sudoku.js:116 5|c6d 9d4 e8c 
            sudoku.js:116 6|dc8 ce5 g7e 
            sudoku.js:119   --- --- --- 
            sudoku.js:116 7|e2f de8 gee 
            sudoku.js:116 8|cd5 6dd gd3 
            sudoku.js:116 9|7de 4fd gee 
*/
            this.eliminateAll = function () {
                var changed = false;

                for (var r = 0; r < this.size; r++) {
                    for (var c = 0; c < this.size; c++) {
                        if (!this.cells[r][c].done) {
                            if (this.cells[r][c].candidates.size == 1) {
                                this.setDigit(r, c, [...this.cells[r][c].candidates][0]);

                                changed = true;
                            }
                        }

                        if (this.cells[r][c].done) {
                            if (this.eliminate(r, c, this.cells[r][c].digit)) {
                                changed = true;
                            }
                        }
                    }

                }

                return changed;
            }

            // Each digit must appear once in each row, column and box
            // For each digit, search each row/col/box and if digit 
            // only appears in 1 location, set it
            this.findSingles = function () {
                var changed = false;

                for (var digit = 1; digit < this.size + 1; digit++) {
                    var rowLocCount, colLocCount, boxLocCount;
                    var rowLocR, rowLocC;
                    var colLocR, colLocC;
                    var boxLocR, boxLocC;

                    // iterate through with 2 counters, and derive r,c for each row, col box etc
                    for (var a = 0; a < this.size; a++) {
                        rowLocCount = 0;
                        colLocCount = 0;
                        boxLocCount = 0;

                        for (var b = 0; b < this.size; b++) {
                            // check this row (r=a, c=b)
                            if (!this.cells[a][b].done) {
                                if (this.cells[a][b].candidates.has(digit)) {
                                    rowLocR = a;
                                    rowLocC = b;
                                    rowLocCount++;
                                }
                            }

                            // check this col (r=b, c=a)
                            if (!this.cells[b][a].done) {
                                if (this.cells[b][a].candidates.has(digit)) {
                                    colLocR = b;
                                    colLocC = a;
                                    colLocCount++;
                                }
                            }

                            // check this box (r = b/3 + (a / 3) * 3, 
                            //                 c = b%3 + (a % 3) * 3)
                            var tmpR = Math.floor(b/3) + (Math.floor(a/3))*3;
                            var tmpC = b%3 + (a%3)*3;
                            //console.log(`(${a+1}, ${b+1}) => Box (${boxLocR+1}, ${boxLocC+1})`);
                            if (!this.cells[tmpR][tmpC].done) {
                                if (this.cells[tmpR][tmpC].candidates.has(digit)) {
                                    boxLocR = tmpR;
                                    boxLocC = tmpC;
                                    boxLocCount++;
                                }
                            }
                        }

                        if (rowLocCount == 1) {
                            console.log(`Row ${a + 1}, ${digit} must be in (${rowLocR + 1},${rowLocC + 1})`);

                            this.setDigit(rowLocR, rowLocC, digit);

                            this.eliminate(rowLocR, rowLocC, digit);

                            changed = true;
                        } else {
                            //console.log(`Row ${a+1}, ${digit} can be in 1 of ${rowLocCount}`);
                        }

                        if (colLocCount == 1) {
                            console.log(`Col ${a + 1}, ${digit} must be in (${colLocR + 1},${colLocC + 1})`);

                            this.setDigit(colLocR, colLocC, digit);

                            this.eliminate(colLocR, colLocC, digit);

                            changed = true;
                        } else {
                            //console.log(`Col ${b+1}, ${digit} can be in 1 of ${colLocCount}`);
                        }

                        if (boxLocCount == 1) {
                            console.log(`Box ${a+1}, ${digit} must be in (${boxLocR + 1},${boxLocC + 1})`);

                            this.setDigit(boxLocR, boxLocC, digit);

                            this.eliminate(boxLocR, boxLocC, digit);

                            changed = true;
                        } else {
                            //console.log(`Box ${r+1}, ${digit} can be in 1 of ${boxLocCount}`);
                        }
                    }
                }

                return changed;
            }

            this.log = function () {
                console.log("  123 456 789");
                console.log("  --- --- ---");
                for (var r = 0; r < size; r++) {
                    var text = "" + (r + 1) + "|";

                    for (var c = 0; c < size; c++) {
                        if (this.cells[r][c].done) {
                            text += this.cells[r][c].digit;
                        } else {
                            text += String.fromCharCode(96 + this.cells[r][c].candidates.size);
                        }

                        if (c % 3 == 2) {
                            text += " ";
                        }
                    }

                    text += " ";

                    for (var c = 0; c < size; c++) {
                        if (this.cells[r][c].done) {
                            text += " xxx";
                        } else {
                            text += " " + this.cells[r][c].candidates.size + ":";

                            this.cells[r][c].candidates.forEach((item, index, set) => {
                                text += item;
                            });
                        }
                    }

                    console.log(text);

                    if (r % 3 == 2) {
                        console.log("  --- --- --- ");
                    }
                }
            }
        }
    }


    return {
        newGame: function (size) {
            board = new Board(size);
        },

        play: function () {
        },

        getBoard: function () {
            return board;
        }
    }
})();

var uiController = (function () {

})();

var boardTests = [
    {
        "in": [
            [3, 9, 0, 0, 0, 2, 0, 0, 0],
            [0, 0, 7, 0, 0, 4, 8, 0, 0],
            [0, 0, 4, 0, 5, 0, 1, 9, 6],
            [6, 7, 2, 1, 0, 0, 0, 8, 4],
            [0, 3, 1, 9, 4, 0, 0, 0, 0],
            [0, 4, 0, 7, 0, 0, 6, 1, 0],
            [9, 2, 0, 4, 0, 3, 5, 6, 0],
            [0, 0, 3, 5, 0, 1, 4, 0, 9],
            [0, 0, 0, 0, 6, 9, 0, 0, 0]
        ]
    },
    {
        "in": [
            [2, 9, 0, 0, 0, 0, 0, 1, 5],
            [8, 0, 0, 1, 7, 2, 0, 0, 6],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [1, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 6, 0, 9, 0, 4, 0, 8, 0],
            [0, 0, 8, 0, 0, 5, 0, 7, 0],
            [0, 2, 0, 0, 0, 8, 0, 0, 0],
            [0, 0, 5, 6, 0, 0, 0, 0, 3],
            [7, 0, 0, 4, 0, 0, 0, 0, 0]
        ]
    },
];




var controller = (function (game, UICtrl) {


    var play = function () {
        game.newGame(4);

        var moves = 0;

        game.play();

        while (true) {
            game.play();
        }
    }

    var runTests = function () {
        var tests = boardTests;

        for (t = 0; t < tests.length; t++) {
            console.log("Running test " + t);

            var size = tests[t].in[0].length;

            game.newGame(size);

            var board = game.getBoard();

            for (r = 0; r < size; r++) {
                for (c = 0; c < size; c++) {
                    if (tests[t].in[r][c] != 0) {
                        board.setDigit(r, c, tests[t].in[r][c]);
                    }
                }
            }

            board.log();

            for (var c = 0; c < 5; c++) {
                board.eliminateAll();

                board.findSingles();
            }

            board.log();

            /*            
                        moved = game.moveLeft();;
            
                        for (r = 0; r < size; r++) {
                            for (c = 0; c < size; c++) {
                                if (cells[r][c] != tests[t].out[r][c]) {
                                    console.log("Test" + t + "(" + r + "," + c + ")=" + cells[r][c] + ", not " + tests[t].out[r][c] + ".");
                                } else {
                                    // console.log("Test" + t + "(" + r + "," + c + ")=" + cells[r][c] + ", yes " + tests[t].out[r][c] + ".");
                                }
                            }
                        }
            */
        }
    };

    return {
        init: function () {
            console.log('Regoku init');

            runTests();

            //play();

            console.log("Jump to hyperspace...");
        }
    };
})(game, uiController);

controller.init();