var sock = require('socket.io');

function attachSocket(app) {

    var io = sock.listen(app);

    io.sockets.on('connection', function(socket) {
	
    socket.on('greetings', function(msg) {
	console.log("user said \"", msg, "\"");
	socket.broadcast.emit('response');
    });

    socket.on('disconnect', function() {
	console.log("user disconnected");
    });

});


}

exports.attachSocket = attachSocket;