document.addEventListener('DOMContentLoaded', function() {
    let n = 12;

    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');

    canvas.height = 600;
    canvas.width = 600;

    let canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    canvas.addEventListener('click', function(event) {
        // Calculate the clicked pixel's coordinates
        let rect = canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;

        x = Math.floor(x / n) * n;
        y = Math.floor(y / n) * n;

        // Color the clicked pixel black
        ctx.fillStyle = "#000000";
        ctx.fillRect(x, y, n, n);

        canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    });

    canvas.addEventListener('mousemove', function(event) {
        ctx.putImageData(canvasData, 0, 0);

        // Calculate the hovered pixel's coordinates
        let rect = canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;

        x = Math.floor(x / n) * n;
        y = Math.floor(y / n) * n;

        // Draw a border around the hovered pixel
        ctx.strokeStyle = "#000000";
        ctx.strokeRect(x, y, n, n);
    });

})