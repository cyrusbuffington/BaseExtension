import {Canvas} from './canvas.js';

document.addEventListener('DOMContentLoaded', () => {
    let board = new Canvas(10, 50);
    board.initializeCanvas();
    board.initializeOutline();

    board.canvas.addEventListener('click', (event) => {
        board.drawPixel(event, "#FF0000");
        board.saveData();

    });
    board.canvas.addEventListener('mousemove', (event) => {
        board.hoverPixel(event, "#000000");
    });

    board.canvas.addEventListener('wheel', (event) => {
        if (event.deltaY < 0) {
            board.zoomIn(event);
        } else {
            board.zoomOut(event);
        }
    });
});

