var http = require('http');
var url = require('url');
var socket = require('socket.io');

function start(route, handle) {

    function onRequest(request, response) {
	var pathname = url.parse(request.url).pathname;
	console.log("Request for " + pathname + " received");
	route(request, response, handle, pathname);
    }

    var app = http.createServer(onRequest);
    var io = socket.listen(app);
    app.listen(8000);

    console.log("Server started.");

    io.sockets.on('connection', function(sock) {
	console.log("user connected to port 8000");

	sock.on('greetings', function(msg) {
	    console.log("user said \"", msg, "\"");
	    sock.emit('response');
	});
	
	sock.on('disconnect', function() {
	    console.log("user disconnected");
	});

    });

}




exports.start = start;