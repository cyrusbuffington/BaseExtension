
const http = require('http').createServer();

const io = require('socket.io')(http, {
    cors: { origin: '*' }
});

io.on('connect', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    socket.on('draw', ({x, y, color}) => {
        console.log(`Drew pixel at x: ${x}, y: ${y} with color: ${color}`);
    });

});

http.listen(3000, () => console.log('listening on port 3000'));
