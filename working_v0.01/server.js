var http = require('http');
var url = require('url');

function start(route, handle) {

    function onRequest(request, response) {
	var pathname = url.parse(request.url).pathname;
	console.log("Request for " + pathname + " received");
	route(request, response, handle, pathname);
    }

    http.createServer(onRequest).listen(80);
    console.log("Server started.");
}

exports.start = start;