var RESOURCE_FOLDER = '/resources';
var requestHandler = require('./requestHandler');

function route(request, response, handle, pathname) {
    
    if (typeof handle[pathname] === 'function') {
	console.log("Handling request for " + pathname);	
	handle[pathname](request, response);
    }
    else if (pathname.match('^' + RESOURCE_FOLDER + '/')) {
	// var filepath = pathname.substr(RESOURCE_FOLDER.length);
	requestHandler.resources(request, response, pathname);
    }
    else {
	console.log("404 not found.");
	requestHandler._404Handler(request, response, pathname);
    }
}

exports.route = route;