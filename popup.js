document.addEventListener('DOMContentLoaded', function() {
    initializeCanvas(6);
});

function initializeCanvas(n) {
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');

    canvas.height = n * 100;
    canvas.width = n * 100;

    fillCanvasWithColor(ctx, "#FFFFFF");

    let canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    canvas.addEventListener('click', function(event) {
        let coordinates = calculatePixelCoordinates(event, n);
        fillPixelWithColor(ctx, coordinates, n, "#000000");
        canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    });

    canvas.addEventListener('mousemove', function(event) {
        ctx.putImageData(canvasData, 0, 0);
        let coordinates = calculatePixelCoordinates(event, n);
        outlinePixel(ctx, coordinates, n, "#000000");
    });
}

function fillCanvasWithColor(ctx, color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function calculatePixelCoordinates(event, n) {
    let rect = event.target.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    x = Math.floor(x / n) * n;
    y = Math.floor(y / n) * n;

    return {x, y};
}

function fillPixelWithColor(ctx, coordinates, n, color) {
    ctx.fillStyle = color;
    ctx.fillRect(coordinates.x, coordinates.y, n, n);
}

function outlinePixel(ctx, coordinates, n, color) {
    ctx.strokeStyle = color;
    ctx.strokeRect(coordinates.x, coordinates.y, n, n);
}