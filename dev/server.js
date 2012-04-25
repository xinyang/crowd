var http = require('http');
var url = require('url');
var socket = require('socket.io');
var attachSocket = require('./socket').attachSocket;

function start(route, handle, PORT) {

    function onRequest(request, response) {
	var pathname = url.parse(request.url).pathname;
	console.log("Request for " + pathname + " received");
	route(request, response, handle, pathname);
    }

    var app = http.createServer(onRequest).listen(PORT);
    console.log("Server started.");
    console.log("user " + "" + " connected to port " + PORT);

    attachSocket(app);
    console.log("Socket.io attached.");

}

exports.start = start;