document.addEventListener("DOMContentLoaded", function(event) {

    var tetris = {
        canvas: (document.getElementById('tetris')).getContext('2d'),
        speed: 1000, //ms
        cellSize: 25,
        cellColor: '#0A52BE',
        currentShape: null,
        currentShapeState: null,
        currentShapePos: null,
        defaultShapePos: [4,0], //x,y

        field : [
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,1,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0]
        ],
        shapes : [
            //########
            //########
            [
                [
                    [0,0,0,0],
                    [0,0,0,0],
                    [1,1,1,1],
                    [0,0,0,0]
                ],
                [
                    [0,1,0,0],
                    [0,1,0,0],
                    [0,1,0,0],
                    [0,1,0,0]
                ]

            ],

            //######
            //  ##
            [
                [
                    [0,0,0],
                    [1,1,1],
                    [0,1,0]
                ],
                [
                    [0,1,0],
                    [1,1,0],
                    [0,1,0]
                ],
                [
                    [0,1,0],
                    [1,1,1],
                    [0,0,0]
                ],
                [
                    [0,1,0],
                    [0,1,1],
                    [0,1,0]
                ]

            ]
            //  ##
            //####
            //##

            //##
            //####
            //  ##

            //####
            //####


        ],
        createShape: function() {
            tetris.currentShape = Math.floor(Math.random() * tetris.shapes.length);
            tetris.currentShapeState = 0;
            tetris.currentShapePos = tetris.defaultShapePos;
            var cords = tetris.getCurrentShapeCords();
            console.log(cords);
            for(var c in cords) {
                console.log(cords[c]);
                tetris.field[cords[c][1]][cords[c][0]] = 1;
            }
            if(!tetris.allowMove(tetris.getCurrentShapeCords())) {
                clearInterval(interval);
                console.log("game over");
                return false;
            }

        },
        getCurrentShapeCords: function() {
            var s = tetris.shapes[tetris.currentShape][tetris.currentShapeState];
            var cords = [];

            for(var sy = 0; sy < s.length; sy++) {
                for(var sx = 0; sx < s[sy].length; sx++) {
                    if(s[sy][sx] == 1) {
                        cords.push([tetris.currentShapePos[0] + sx, tetris.currentShapePos[1] + sy]);
                    }
                }
            }
            return cords;
        },
        /**
         * @param vector
        */
        moveShape: function (strVector) {
            var vector;
            if(strVector == 'left') {
                vector = [-1,0];
            } else if(strVector == 'right') {
                vector = [1,0];
            } else if(strVector == 'up') {
                vector = [0,-1];
            } else {
                vector = [0,1];
            }

            //удалили старое
            var oldCords = tetris.getCurrentShapeCords();
            for(var c in oldCords) {
                tetris.field[oldCords[c][1]][oldCords[c][0]] = 0;
                tetris.eraseCell(oldCords[c][0], oldCords[c][1]);
            }
            //обновить позицию фигуры
            tetris.currentShapePos = [
                tetris.currentShapePos[0] + vector[0],
                tetris.currentShapePos[1] + vector[1]
            ];
            //добавить новые координаты в массив поля
            var cords = tetris.getCurrentShapeCords();

            if(tetris.allowMove(cords)) {
                for(var c in cords) {
                    tetris.field[cords[c][1]][cords[c][0]] = 1;
                    tetris.fillCell(cords[c][0], cords[c][1]);
                }
            } else {
                //вернуть обратно позицию фигуры
                tetris.currentShapePos = [
                    tetris.currentShapePos[0] - vector[0],
                    tetris.currentShapePos[1] - vector[1]
                ];
                for(var c in oldCords) {
                    tetris.field[oldCords[c][1]][oldCords[c][0]] = 1;
                    tetris.fillCell(oldCords[c][0], oldCords[c][1]);
                }
                if(strVector == 'down') {
                    tetris.checkRows();
                    tetris.createShape();
                }
            }


        },
        rotateShape: function() {
            //удалили старое
            var oldCords = tetris.getCurrentShapeCords();
            for(var c in oldCords) {
                tetris.field[oldCords[c][1]][oldCords[c][0]] = 0;
                tetris.eraseCell(oldCords[c][0], oldCords[c][1]);
            }

            //обновить состояние фигуры
            var oldState = tetris.currentShapeState;
            var state = tetris.currentShapeState + 1;
            if(state >= tetris.shapes[tetris.currentShape].length) {
                state = 0;
            }
            tetris.currentShapeState = state;

            //добавить новые координаты в массив поля
            var cords = tetris.getCurrentShapeCords();

            if(tetris.allowMove(cords)) {
                for(var c in cords) {
                    tetris.field[cords[c][1]][cords[c][0]] = 1;
                    tetris.fillCell(cords[c][0], cords[c][1]);
                }
            } else {
                //вернуть обратно позицию фигуры
                tetris.currentShapeState = oldState;
                for(var c in oldCords) {
                    tetris.field[oldCords[c][1]][oldCords[c][0]] = 1;
                    tetris.fillCell(oldCords[c][0], oldCords[c][1]);
                }
            }
        },
        allowMove: function (cords) {
            for(var c in cords) {
                if(typeof tetris.field[cords[c][1]] == 'undefined' ||
                    typeof tetris.field[cords[c][1]][cords[c][0]] == 'undefined' ||
                    tetris.field[cords[c][1]][cords[c][0]] == 1)
                {
                    return false;
                }
            }
            return true;
        },
        checkRows: function () {
            var rowToRemove;
            for(var y = 0; y < tetris.field.length; y++) {
                rowToRemove = y;
                for(var x = 0; x < tetris.field[y].length; x++) {
                    if(tetris.field[y][x] != 1) {
                        rowToRemove = null;
                    }
                }
                if(rowToRemove != null) {
                    tetris.removeRow(rowToRemove);
                }
            }
        },
        removeRow: function (y) {
            while(y >0) {
                tetris.field[y] = tetris.field[y-1].slice();
                y--;
            }
        },
        drawField: function() {
            for(var y = 0; y < tetris.field.length; y++) {
                for(var x = 0; x < tetris.field[y].length; x++) {
                    if(tetris.field[y][x] == 1) {
                        tetris.fillCell(x,y);
                        //console.log("x:" + x + ", y: " + y);
                    } else {
                        tetris.eraseCell(x,y);
                    }
                }
            }
        },
        fillCell: function(x, y) {
            tetris.canvas.fillStyle = tetris.cellColor;
            tetris.canvas.fillRect(tetris.cellSize * x, tetris.cellSize * y, tetris.cellSize, tetris.cellSize);
        },
        eraseCell: function(x,y) {
            tetris.canvas.fillStyle = '#FFFFFF';
            tetris.canvas.fillRect(tetris.cellSize * x, tetris.cellSize * y, tetris.cellSize, tetris.cellSize);
        },
        tick: function() {
            tetris.moveShape('down');
            tetris.drawField();
        }
    };

    window.onkeydown = function (e) {
        console.log(e.keyCode);
        if(e.keyCode == 38) {
            tetris.rotateShape();
            return;
        }
        var vector = 'down';
        if(e.keyCode == 37) {
            vector = 'left';
        } else if(e.keyCode == 39) {
            vector = 'right';
        } else if(e.keyCode == 96) {
            vector = 'up';
        }
        tetris.moveShape(vector);
    };

    var t = tetris;
    var interval = setInterval(tetris.tick, tetris.speed);
    tetris.createShape();


    console.log(typeof tetris.field[25]);
});