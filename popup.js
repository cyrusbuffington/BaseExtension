import {Canvas} from './canvas.js';



document.addEventListener('DOMContentLoaded', () => {

    
    initializePallete();
    let board = new Canvas(10, 50); // n = pixel size, length = canvas dimensions in terms of pixels
    board.initializeCanvas();
    board.initializeOutline();
    
    // Load data from storage
    

    let canvasElement = document.getElementById('canvas');

    let dashboard = document.getElementById('dashboard');

    let pallete = document.getElementById('pallete');
    let canvas = board.canvas;
    let currentColor = document.getElementById('current-color');
    currentColor.style.backgroundColor = board.color;

    let plus = document.getElementById('plus');
    let minus = document.getElementById('minus');

    let pan = document.getElementById('pan');
    let bucket = document.getElementById('bucket');
    let draw = document.getElementById('draw');

    let prev = document.getElementById('prev');
    let next = document.getElementById('next');

    canvasElement.addEventListener('mouseleave', () => {
        board.ctx.putImageData(board.canvasData, 0, 0);
    });

    canvas.addEventListener('click', (event) => {
        //if (board.mode == 0) board.drawPixel(event);
        if (board.mode == 2) board.zoomIn(event);
        else if (board.mode == 3) board.zoomOut(event);
        else if (board.mode == 4) board.fill(event);
    });

    canvas.addEventListener('mousemove', (event) => {
        if (board.mode == 0) board.hoverPixel(event);
    });


    canvas.addEventListener('wheel', (event) => {
        if (event.deltaY < 0) {
            board.zoomIn(event);
        } else {
            board.zoomOut(event);
        }
    });


    canvas.addEventListener('mousedown', (event) => {
        if (board.mode == 0) {
            board.isDragging = true;
            board.drawPixel(event);
        }
        else if (board.mode == 1) board.onMouseDown(event);
    });


    canvas.addEventListener('mousemove', (event) => {
        if (board.mode == 0 && board.isDragging) {
            board.drawPixel(event);
        }
        else if (board.mode == 1) board.onMouseMove(event);
    });


    canvas.addEventListener('mouseup', (event) => {
        if (board.mode == 0) {
            board.isDragging = false;
            board.saveState();
        }
        else if (board.mode == 1) board.onMouseUp(event);
    });     

    //CONTROLS
    pallete.addEventListener('click', (event) => {
        board.color = event.target.style.backgroundColor;
        currentColor.style.backgroundColor = board.color;
    });


    plus.addEventListener('click', () => {
        board.mode = 2;
        canvasElement.style.cursor = "zoom-in";
    });


    minus.addEventListener('click', () => {
        board.mode = 3;
        canvasElement.style.cursor = "zoom-out";
    });

    pan.addEventListener('click', () => {
        board.mode = 1;
        canvasElement.style.cursor = "grab";
    });

    bucket.addEventListener('click', () => {
        board.mode = 4;
        canvasElement.style.cursor = "pointer";
    });

    draw.addEventListener('click', () => {
        board.mode = 0;
        canvasElement.style.cursor = "default";
    });

    prev.addEventListener('click', () => {
        board.loadPreviousState();
    });

    next.addEventListener('click', () => {
        board.loadNextState();
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

