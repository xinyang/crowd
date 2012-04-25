
var io = require('socket.io').listen(3333);

io.sockets.on(connection, function(socket) {
    console.log("user connected to port 3333");

    socket.on('greetings', function(msg) {
	console.log("user said \"", msg, "\"");
	socket.emit('response');
    });

    socket.on('disconnect', function() {
	console.log("user disconnected");
    });

});

}

exports.sock = sock;