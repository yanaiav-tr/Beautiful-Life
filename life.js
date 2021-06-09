'use strict';

let zoom = 6;
let interval = 50;
let initRatio = 0.05;

let markedForUpdate = [];
let markedForCalc = [];
const board = [];
const COL_LENGTH = 100;
const ROW_LENGTH = 300;

function init() {
    const canvas = document.createElement('canvas');
    canvas.width = ROW_LENGTH * zoom;
    canvas.height = COL_LENGTH * zoom;
    document.querySelector('body').appendChild(canvas);
    createBoard();
    refNeighbours();
    initState();
    setInterval(update, interval);
}

function createBoard() {
    for (let i = 0; i < COL_LENGTH; i++) {
        const row = []
        for (let j = 0; j < ROW_LENGTH; j++) {
            const coords = { x: j * zoom, y: i * zoom };
            row.push(new Tile(coords))
        }
        board.push(row)
    }
}

function initState() {
    createBackground('black');
    switchRand(initRatio);
}

function refNeighbours() {
    board.forEach((row, rowIdx) => {
        row.forEach((tile, tileIdx) => {
            for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
                for (let j = tileIdx - 1; j <= tileIdx + 1; j++) {
                    if (i !== rowIdx || j !== tileIdx) {
                        board[i] && board[i][j] && tile.neighbours.push(board[i][j])
                    }
                }
            }
        });
    })
}

function markForUpdate(tile) {
    if (!markedForUpdate.includes(tile)) {
        markedForUpdate.push(tile);
    }
}

function markForCalc(tile) {
    if (!markedForCalc.includes(tile)) {
        markedForCalc.push(tile);
    }
}

function update() {
    const tilesToUpdate = markedForUpdate;
    markedForUpdate = [];
    tilesToUpdate.forEach(tile => {
        tile.isAlive = tile.isNextAlive;
        tile.neighbours.forEach(n => markForCalc(n));
        render(tile)
    })
    markedForCalc.forEach(tile => tile.calculate())
    markedForCalc = [];
}

function render(tile) {
    const canvas = document.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    if (tile.isAlive) {
        ctx.fillStyle = getRandomBrightColor();
        ctx.beginPath()
        ctx.arc(tile.coords.x + zoom/2, tile.coords.y + zoom/2, zoom/2, 0, 360);
        ctx.fill();
        ctx.closePath();
    } else {
        ctx.fillStyle = 'black';
        ctx.fillRect(tile.coords.x, tile.coords.y, zoom, zoom);
    }
    
}

function createBackground(color) {
    const canvas = document.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, ROW_LENGTH * zoom, COL_LENGTH * zoom);
}

function switchRand(ratio) {
    const amountToSwitch = board.length * board[0].length * ratio;
    const tilesSwitched = [];
    for (let i = 0; i < amountToSwitch; i++) {
        const tile = getRandomTile(tilesSwitched);
        tilesSwitched.push(tile);
        tile.isNextAlive = true;
        markForUpdate(tile);
        markForCalc(tile);
    }
}

function getRandomTile(exclude) {
    const rowIdx = Math.floor(Math.random() * board.length); 
    const tileIdx = Math.floor(Math.random() * board[0].length); 
    const tile = board[rowIdx][tileIdx];
    return exclude.includes(tile) ? getRandomTile(exclude) : tile;
}

function getRandomBrightColor() {
    const r = (Math.ceil(Math.random() * 128 + 128)).toString(16);
    const g = (Math.ceil(Math.random() * 128 + 128)).toString(16);
    const b = (Math.ceil(Math.random() * 128 + 128)).toString(16);
    return '#' + r + g + b;
}

class Tile {
    constructor(coords) {
        this.coords = coords;
    }
    coords;
    isAlive = false;
    isNextAlive = false;
    neighbours = [];
    calculate() {
        const liveNeighboursCount = this.neighbours.filter(n => n.isAlive).length;
        this.isNextAlive = liveNeighboursCount === 3 || liveNeighboursCount === 2 && this.isAlive;
        if (this.isNextAlive !== this.isAlive) {
            markForUpdate(this);
        }
    }
}
