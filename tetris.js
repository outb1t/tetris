const gridSizeX = 10;
const gridSizeY = 20;
const cellSize = 20;
const tickRate = 200;

const canvas = document.createElement('canvas');
canvas.width = gridSizeX * cellSize;
canvas.height = gridSizeY * cellSize;
canvas.id = "container"
document.body.appendChild(canvas);

let gameOver = false;

const ctx = canvas.getContext('2d');

let currentShapeColor = getColor();
let currentShapePos = null;
let currentShape = null;

const field = [];
const shapes = [
    [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ],
    [
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
    ],
    [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ],
];

addEventListener('DOMContentLoaded', function () {

    startGame();

    document.onkeydown = onKeyDown;
    setInterval(tick, tickRate);
});

function getColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

function onKeyDown(e) {
    if (gameOver) {
        return;
    }
    if (e.key === "ArrowDown") {
        move(0, 1);
    } else if (e.key === "ArrowLeft") {
        move(-1, 0);
    } else if (e.key === "ArrowRight") {
        move(1, 0);
    } else if (e.key === "ArrowUp") {
        rotate(1);
    }
    draw();

}

function startGame() {
    gameOver = false;
    generateField();
    addNextShape();
    draw();
}

function move(xShift, yShift) {
    let currentX = currentShapePos[0]
    let currentY = currentShapePos[1];

    let newXPos = currentX + xShift;
    let newYPos = currentY + yShift;

    let hasCollision = checkCollisions(newXPos, newYPos, currentShape);
    if (hasCollision) {
        if (xShift === 0 && yShift === 1) {
            addNextShape();
        }
        return false;
    }

    currentShapePos[0] = newXPos;
    currentShapePos[1] = newYPos;

    return true;
}

function generateField() {
    for (let y = 0; y < gridSizeY; y++) {
        field[y] = [];
        for (let x = 0; x < gridSizeX; x++) {
            field[y][x] = [0, '#000'];
        }
    }
}

function addNextShape() {
    if (currentShape !== null) {
        fixShapeOnField();
        updateField();
    }

    currentShapeColor = getColor();
    currentShapePos = [3, 0];

    let nextShapeIndex = Math.random() > 0.3 ? Math.floor(Math.random() * shapes.length) : 0;
    let newShape = shapes[nextShapeIndex].map(function (arr) {
        return arr.slice();
    });

    let hasCollision = checkCollisions(currentShapePos[0], currentShapePos[1], newShape);
    if (hasCollision) {
        gameOver = true;
    }

    currentShape = newShape;
}

function updateField() {
    let removeRows = [];
    for (let y = 0; y < field.length; y++) {
        let fullRow = true;
        for (let x = 0; x < field[y].length; x++) {
            if (field[y][x][0] === 0) {
                fullRow = false;
            }
        }
        if (fullRow) {
            removeRows.push(y);
        }
    }

    if (removeRows.length > 0) {
        removeRows = removeRows.reverse();
        for (let i = 0; i < removeRows.length; i++) {
            field.splice(removeRows[i], 1);
        }
        for (let n = 0; n < removeRows.length; n++) {
            let emptyRow = [];
            for(let m = 0; m < gridSizeX; m++) {
                emptyRow.push([0, '#000']);
            }
            field.unshift(emptyRow);
        }
    }
}

function fixShapeOnField() {
    foreach(currentShape, currentShapePos[0], currentShapePos[1], (value, x, y) => {
        if (value === 1) {
            field[y][x][0] = 1;
            field[y][x][1] = currentShapeColor;
        }
    });
}

function checkCollisions(onXPos, onYPos, shape) {
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x] === 1) {
                if (field[onYPos + y] === undefined) {
                    return true;
                }
                if (field[onYPos + y][onXPos + x] === undefined) {
                    return true;
                }
                if (field[onYPos + y][onXPos + x][0] === 1) {
                    return true;
                }
            }
        }
    }
    return false;
}

function rotate(direction) {
    // O shape
    if (currentShape[0].length !== currentShape.length) {
        return false;
    }

    // 1 2 3    7 4 1
    // 4 5 6 => 8 5 2
    // 7 8 9    9 6 3
    let rotatedShape = currentShape.map(function (arr) {
        return arr.slice();
    });
    let N = rotatedShape.length;
    for (let i = 0; i < parseInt(N / 2); i++) {
        for (let j = i; j < N - i - 1; j++) {
            let temp = rotatedShape[i][j];
            rotatedShape[i][j] = rotatedShape[N - 1 - j][i];
            rotatedShape[N - 1 - j][i] = rotatedShape[N - 1 - i][N - 1 - j];
            rotatedShape[N - 1 - i][N - 1 - j] = rotatedShape[j][N - 1 - i];
            rotatedShape[j][N - 1 - i] = temp;
        }
    }

    let hasCollisions = checkCollisions(currentShapePos[0], currentShapePos[1], rotatedShape);
    if (hasCollisions) {
        return false;
    }

    currentShape = rotatedShape;

    return true;
}

function draw() {
    drawField();
    drawCurrentShape();
}

function drawField() {
    foreach(field, 0, 0, (value, x, y) => {
        if (value[0] === 1) {
            fillCell(x, y, value[1]);
            strokeCell(x, y);
        } else {
            clearCell(x, y);
        }
    });
}

function drawCurrentShape() {
    foreach(currentShape, currentShapePos[0], currentShapePos[1], (value, x, y) => {
        if (value === 1) {
            fillCell(x, y, currentShapeColor);
            strokeCell(x, y);
        }
    });
}

function clearCurrentShape() {
    foreach(currentShape, currentShapePos[0], currentShapePos[1], (value, x, y) => {
        if (value === 1) {
            clearCell(x, y);
        }
    });
}

function foreach(arr, offsetX, offsetY, callback) {
    for (let y = 0; y < arr.length; y++) {
        for (let x = 0; x < arr[y].length; x++) {
            let fieldPosX = offsetX + x;
            let fieldPosY = offsetY + y;
            callback(arr[y][x], fieldPosX, fieldPosY);
        }
    }
}

function fillCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

function strokeCell(x, y) {
    ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

function clearCell(x, y) {
    ctx.clearRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

function tick() {
    if (gameOver) {
        return;
    }
    move(0, 1);
    draw();
}