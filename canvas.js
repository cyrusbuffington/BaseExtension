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

        this.color = "#000000";

        this.mode = 0; // 0 = draw, 1 = pan, 2 = zoom in, 3 = zoom out, 4 = fill

        this.states = [];
        this.currentState = -1;
        this.changesMade = 0;
    }

    initializeCanvas(canvasData = null) {
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.willReadFrequently = true;

        this.canvas.height = this.n * this.length;
        this.canvas.width = this.n * this.length;

        this.fillCanvasWithColor();

        this.loadFromChromeStorage().then(() => {
            this.saveData();
            this.saveState();;
        });

        this.saveData();
        this.saveState();

        
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0px';
        this.canvas.style.left = '0px';
        this.outlineCanvas.style.position = 'absolute';
        this.outlineCanvas.style.top = '0px';
        this.outlineCanvas.style.left = '0px';

    }

    initializeOutline() {
        this.outlineCanvas.height = this.n * this.length;
        this.outlineCanvas.width = this.n * this.length;
        this.outlineCtx.clearRect(0, 0, this.outlineCanvas.width, this.outlineCanvas.height);
        this.outlineCtx.fillStyle = "#808080"; 
        for (let i = 0; i <= this.canvas.width; i += this.n) {
            this.outlineCtx.fillRect(i, 0, 1, this.canvas.height);
        }
        for (let i = 0; i <= this.canvas.height; i += this.n) {
            this.outlineCtx.fillRect(0, i, this.canvas.width, 1);
        }

        this.outlineCanvas.classList.add('hide');

        

    }

    saveToChromeStorage() {
        const pixelArray = Array.from(this.canvasData.data);
        const imageDataToSave = {
            data: pixelArray,
            width: this.canvasData.width,
            height: this.canvasData.height,
            colorSpace: this.canvasData.colorSpace
        };
        const serializedImageData = JSON.stringify(imageDataToSave);
        chrome.storage.local.set({['canvasData']: serializedImageData}, () => {
            console.log('ImageData saved');
        });
    }

    fetchFromChromeStorage() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(['canvasData'], (result) => {
                if (result['canvasData']) {
                    const imageDataObject = JSON.parse(result['canvasData']);
                    const pixelData = new Uint8ClampedArray(imageDataObject.data);
                    const imageData = new ImageData(pixelData, imageDataObject.width, imageDataObject.height);
                    console.log('ImageData fetched');
                    resolve(imageData);
                } else {
                    console.log('No ImageData found');
                }
            });
        });
    }

    async loadFromChromeStorage() {
        const imageData = await this.fetchFromChromeStorage();
        this.loadData(imageData);
    }


    saveData() {
        this.canvasData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    saveState() {
        this.states.splice(this.currentState + 1, 1, this.canvasData);
        this.currentState++;

        this.changesMade++;
        if (this.changesMade > 3) {
            this.saveToChromeStorage();
            this.changesMade = 0;
        }

    }

    loadData(data) {
        this.ctx.putImageData(data, 0, 0);
        this.canvasData = data;
    }

    loadPreviousState() {
        if (this.currentState > 0) {
            this.currentState--;
            this.loadData(this.states[this.currentState]);
        }
        this.saveToChromeStorage();
    }

    loadNextState() {
        if (this.currentState < this.states.length - 1) {
            this.currentState++;
            this.loadData(this.states[this.currentState]);
        }
        this.saveToChromeStorage();
    }


    fillCanvasWithColor(color="#ffffff") {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    clearCanvas() {
        this.fillCanvasWithColor();
        this.saveData();
        this.saveState();
        this.saveToChromeStorage();
    }

    drawPixel(event, color = this.color, hover = false) {
        let coordinates = this.calculatePixelCoordinates(event);
        let initialColor = this.getPixelColor(coordinates.x, coordinates.y);
        if (this.placeEnabled && (this.isDragging || hover)) {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(coordinates.x, coordinates.y, this.n, this.n);
        }
        if (!hover && this.placeEnabled && initialColor != this.getPixelColor(coordinates.x, coordinates.y)) {
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

    calculateTileCoordinates(event) {
        let rect = this.canvas.getBoundingClientRect();
        let x = Math.floor((event.clientX - rect.left) / this.n / this.zoom);
        let y = Math.floor((event.clientY - rect.top) / this.n / this.zoom);
        return {x , y};
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

            this.revertCanvasPosition();
        }

        if (this.zoom >= 2){
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

            this.revertCanvasPosition();
        }
        if (this.zoom < 2){
            this.outlineCanvas.classList.add('hide');
        }

        setTimeout(() => {
            this.placeEnabled = true;
        }, 100);
        
    }

    onMouseDown(event) {
        this.isDragging = true;

        this.startX = event.clientX;
        this.startY = event.clientY;
        
        if (this.isDragging) {
            document.body.style.cursor = "grabbing";
        }

    }

    onMouseMove(event) {
        if (!this.isDragging) return;
    
        this.placeEnabled = false;

        if (this.zoom == 1) return;


        this.offsetX = event.clientX - this.startX;
        this.offsetY = event.clientY - this.startY;
        this.startX = event.clientX;
        this.startY = event.clientY;

        this.updateCanvasPosition();
    }

    onMouseUp() {
        this.isDragging = false;
        setTimeout(() => {
            this.placeEnabled = true;
        }, 0);
        
        document.body.style.cursor = "default";
        
    }
    updateCanvasPosition() {
        this.moveCanvasByOffset(this.offsetX, this.offsetY);
    }

    moveCanvasByOffset(offsetX, offsetY) {
        // Get the current position
        let currentX = parseInt(this.canvas.style.left, 10);
        let currentY = parseInt(this.canvas.style.top, 10);

        //Calculate the new position with bounds checking

        let rect = this.canvas.getBoundingClientRect();

        let lowerBound =  (this.n * this.length - this.zoom * this.n * this.length);

        let newX = rect.left + offsetX <= 0 && rect.left + offsetX >= lowerBound ? currentX + offsetX : currentX;
        
        let newY = rect.top + offsetY <= 0 && rect.top + offsetY >= lowerBound ? currentY + offsetY : currentY;

        // Update the position
        this.canvas.style.left = `${newX}px`;
        this.outlineCanvas.style.left = `${newX}px`;
        this.canvas.style.top = `${newY}px`;
        this.outlineCanvas.style.top = `${newY}px`;
    }

    revertCanvasPosition() {
        this.canvas.style.left = '0px';
        this.canvas.style.top = '0px';
        this.outlineCanvas.style.left = '0px';
        this.outlineCanvas.style.top = '0px';
    }

    getPixelColor(x, y) {
        let pixelData = this.ctx.getImageData(x, y, 1, 1).data;
        let color = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;
        return color;
    }
    setPixelColor(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, this.n, this.n);
    }

    fill(event) {
        let coordinates = this.calculatePixelCoordinates(event);
        let color = this.getPixelColor(coordinates.x, coordinates.y);
        let stack = [coordinates];
        let visited = new Set();
        let n = this.n;

        while (stack.length > 0) {
            let current = stack.pop();
            let x = current.x;
            let y = current.y;

            if (visited.has(`${x},${y}`)) continue;

            visited.add(`${x},${y}`);

            if (x < 0 || x >= this.canvas.width || y < 0 || y >= this.canvas.height) continue;

            let currentColor = this.getPixelColor(x, y);

            if (currentColor != color) continue;

            this.setPixelColor(x, y, this.color);

            stack.push({x: x + this.n, y: y});
            stack.push({x: x - this.n, y: y});
            stack.push({x: x, y: y + this.n});
            stack.push({x: x, y: y - this.n});
        }
        this.saveData();
        this.saveState();
    }


}



export { Canvas };

