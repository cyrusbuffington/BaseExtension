class Canvas {
    constructor(n, length) {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.zoom = 1;
        this.n = n;
        this.length = length;
        this.canvasData = null; 
        this.placeEnabled= true;

        this.outlineCanvas = document.getElementById('outlineCanvas');
        this.outlineCtx = this.outlineCanvas.getContext('2d');

        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    initializeCanvas() {
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.willReadFrequently = true;

        this.canvas.height = this.n * this.length;
        this.canvas.width = this.n * this.length;

        this.fillCanvasWithColor("#FFFFFF");
        this.saveData();

    }

    initializeOutline() {
        this.outlineCanvas.height = this.n * this.length;
        this.outlineCanvas.width = this.n * this.length;
        this.outlineCtx.clearRect(0, 0, this.outlineCanvas.width, this.outlineCanvas.height);
        this.outlineCtx.fillStyle = "#000000";
        for (let i = 0; i < this.canvas.width; i += this.n) {
            this.outlineCtx.fillRect(i, 0, 1 / this.zoom, this.canvas.height);
        }
        for (let i = 0; i < this.canvas.height; i += this.n) {
            this.outlineCtx.fillRect(0, i, this.canvas.width, 1 / this.zoom);
        }

        this.outlineCanvas.classList.add('hide');
    }

    saveData() {
        this.canvasData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }


    fillCanvasWithColor(color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    drawPixel(event, color, hover = false) {
        if (this.placeEnabled) {
            this.ctx.fillStyle = color;
            let coordinates = this.calculatePixelCoordinates(event);
            this.ctx.fillRect(coordinates.x, coordinates.y, this.n, this.n);
        }
        if (!hover && this.placeEnabled) {
            this.saveData();
        }
    }

    hoverPixel(event) {
        this.ctx.putImageData(this.canvasData, 0, 0);
        this.ctx.globalCompositeOperation = 'multiply'; // Set the composite operation to 'multiply'
        this.drawPixel(event, "rgba(0, 0, 0, 0.5)", true); // Fill the pixel with a semi-transparent black color
        this.ctx.globalCompositeOperation = 'source-over'; // Reset the composite operation to 'source-over'

    }

    calculatePixelCoordinates(event) {
        let rect = event.target.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;

        x = Math.floor(x / this.n / this.zoom) * this.n;
        y = Math.floor(y / this.n / this.zoom) * this.n;

        return {x, y};
    }

    calculateRealCoordinates(event) {
        let rect = this.canvas.getBoundingClientRect(); 
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        return {x, y};
    }

    zoomIn(event) {

        event.preventDefault();
        let coordinates = this.calculateRealCoordinates(event);

        if (this.zoom < 4) {
            this.placeEnabled = false;

            this.canvas.style.transformOrigin = `${coordinates.x / this.zoom}px ${coordinates.y / this.zoom}px`;
            this.outlineCanvas.style.transformOrigin = `${coordinates.x / this.zoom}px ${coordinates.y / this.zoom}px`;

            this.zoom *= 2;

            this.canvas.style.transform = `scale(${this.zoom})`;
            this.outlineCanvas.style.transform = `scale(${this.zoom})`;
        }

        if (this.zoom == 4){
            this.outlineCanvas.classList.remove('hide');
        }
        setTimeout(() => {
            this.placeEnabled = true;
        }, 100);

        
    }

    zoomOut(event) {

        event.preventDefault();
        let coordinates = this.calculateRealCoordinates(event);

        if (this.zoom > 1) {
            this.placeEnabled = false;

            this.canvas.style.transformOrigin = `${coordinates.x / this.zoom}px ${coordinates.y / this.zoom}px`;
            this.outlineCanvas.style.transformOrigin = `${coordinates.x / this.zoom}px ${coordinates.y / this.zoom}px`;

            this.zoom/= 2;

            this.canvas.style.transform = `scale(${this.zoom})`;
            this.outlineCanvas.style.transform = `scale(${this.zoom})`;
        }
        if (this.zoom != 4){
            this.outlineCanvas.classList.add('hide');
        }
        setTimeout(() => {
            this.placeEnabled = true;
        }, 100);
        
    }




    onMouseDown(event) {
        this.isDragging = true;
        this.startX = event.clientX - this.offsetX;
        this.startY = event.clientY - this.offsetY;
    }

    onMouseMove(event) {
        if (!this.isDragging) return;
    
        this.placeEnabled = false;

        if (this.zoom == 1) return;


        this.offsetX = event.clientX - this.startX;
        this.offsetY = event.clientY - this.startY;

        this.updateCanvasPosition();
    }

    onMouseUp() {
        this.isDragging = false;
        setTimeout(() => {
            this.placeEnabled = true;
        }, 0);

        let rect = this.canvas.getBoundingClientRect();
        console.log(rect.top, rect.left);
        
    }
    updateCanvasPosition() {
        let rect = this.canvas.getBoundingClientRect();

        if (rect.top > -1500 && rect.top < 0) {
            this.canvas.style.top = `${this.offsetY}px`;
            this.outlineCanvas.style.top = `${this.offsetY}px`;
        }
        
        if (rect.left > -1500 && rect.left < 0) {
            this.canvas.style.left = `${this.offsetX}px`;
            this.outlineCanvas.style.left = `${this.offsetX}px`;
        }
        


    }

}

export { Canvas };

