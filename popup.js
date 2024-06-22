import {Canvas} from './canvas.js';

document.addEventListener('DOMContentLoaded', () => {
    initializePallete();
    let board = new Canvas(10, 50); // n = pixel size, length = canvas dimensions in terms of pixels
    board.initializeCanvas();
    board.initializeOutline();

    let pallete = document.getElementById('pallete');
    let canvas = board.canvas;
    let currentColor = document.getElementById('current-color');
    currentColor.style.backgroundColor = board.color;

    canvas.addEventListener('click', (event) => {
        board.drawPixel(event);

    });
    canvas.addEventListener('mousemove', (event) => {
        board.hoverPixel(event);
    });

    canvas.addEventListener('wheel', (event) => {
        if (event.deltaY < 0) {
            board.zoomIn(event);
        } else {
            board.zoomOut(event);
        }
    });


    canvas.addEventListener('mousedown', (event) => {
        board.onMouseDown(event);
    });

    canvas.addEventListener('mousemove', (event) => {
        board.onMouseMove(event);
    });

    canvas.addEventListener('mouseup', (event) => {
        board.onMouseUp(event);
    });     

    pallete.addEventListener('click', (event) => {
        board.color = event.target.style.backgroundColor;
        currentColor.style.backgroundColor = board.color;
    });
});


function initializePallete() {
    let pallete = document.getElementById('pallete');
    let colors = 
                 [
                  "#6d001a","#be0039", "#ff4500","#ffa800","#ffd635","#fff8b8","#00a368","#00cc78",
                  "#7eed56","#00756f","#009eaa","#00ccc0","#2450a4","#3690ea","#51e9f4","#493ac1",
                  "#000000","#515252","#898d90","#d4d7d9","#ffffff","#ffb470","#9c6926","#6d482f",
                  "#ff99aa","#ff3881","#de107f","#e4abff","#b44ac0","#811e9f","#94b3ff", "#6a5cff"
                ]

    colors.forEach(color => {
        let col = document.createElement('div');
        col.id = 'color';
        col.style.backgroundColor = color;
        pallete.appendChild(col);
    });
}

