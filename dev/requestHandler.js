var path = require('path');
var fs = require('fs');

function index(request, response) {
    console.log('index request starting...');
    fs.readFile('./index.htm' , function(error, content) {
        if (error) {
	    console.log("500 server error");
	    _500Handler(request, response, error);
        }
        else {
	    response.writeHead(200, { 'Content-Type': 'text/html' });
	    response.write(content, 'utf-8');
	    response.end()
        }
    });

}

function sync(request, response) {
    
    ntp=require('ntp');
    var app = require('http').createServer(handler) 
    function handler(request,response){
	ntp.static(request,response,servepage);
    };
    app.listen(80);
    ntp.listen(app);
    
    function servepage (request,response) {
	require('fs').readFile('sync.htm',
			       function(error, content) {
				   if (error) {
				       response.writeHead(500);
				       response.end();
				   } else {
				       response.writeHead(200, {
					   'Content-Type': 'text/html'
				       });
				       response.end(content, 'utf-8');
				   }
			       });
    }
    
}


function resources(request, response, filePath) {
    console.log('resource request starting...');
    filePath = '.' + filePath;
    var extname = path.extname(filePath);
    console.log(extname);
    var contentType = 'text/html';
    switch (extname) {
    case '.js':
        contentType = 'text/javascript';
        break;
    case '.css':
        contentType = 'text/css';
        break;
    case '.mp3':
	contentType = 'audio/mpeg';
	break;
    case '.m4a':
	contentType = 'audio/m4a';
	break;
    }

    var isAudio = contentType.split('/')[0] === 'audio';

    path.exists(filePath, function(exists) {
	
        if (exists) {
	    
	    if (isAudio) {
		audioResourceHandler(request, response, filePath, contentType);
	    }
	    else {
		defaultResourceHandler(request, response, filePath, contentType);
	    }
	    
        }
        else {
	    _404Handler(request, response, filePath);
        }
    });
    
}

function audioResourceHandler(request, response, filePath, contentType) {
    console.log("Handling audio request.");
    try { 
	content = fs.readFileSync(filePath);
    }
    catch (error) {
	console.log("500 server error");
	_500Handler(request, response, error);
	return;
    }
    
    var range = request.headers.range; 
    var total = content.length; 
    var parts = range.replace(/bytes=/, "").split("-"); 
    var partialstart = parts[0]; 
    var partialend = parts[1]; 
    var start = parseInt(partialstart, 10); 
    var end = partialend ? parseInt(partialend, 10) : total-1; 
    var chunksize = (end-start)+1; 
    response.writeHead(206, { "Content-Range": "bytes " + start + "-" 
			      + end + "/" + total, "Accept-Ranges": "bytes", "Content-Length": 
			      chunksize, "Content-Type": contentType }); 
    response.end(content.slice(start, end), "binary"); 

}

function defaultResourceHandler(request, response, filePath, contentType) {
    console.log("Handling non-audio request.");
    fs.readFile(filePath, function(error, content) {
	if (error) {
	    console.log("500 server error");
	    _500Handler(request, response, error);
	}
        else {
	    var resEncoding = '';
	    response.writeHead(200, { 'Content-Type': contentType });
	    if (contentType.substring(0, 4) === 'text')
		resEncoding = 'utf-8';
	    response.write(content, resEncoding);
	    response.end();
        }
    });
}

function _404Handler(request, response, pathname) {
    fs.readFile('./404.htm', function(error, content) {
	if (error) {
	    _500Handler(request, response, error);
	}
	else {
	    response.writeHead(404, { 'Content-Type':'text/html' });
	    response.write(content, 'utf-8');
	    response.end();
	}
    });
}

function _500Handler(request, response, error) {
    fs.readFile('./500.htm', function(error, content) {
	if (error) {
	    response.writeHead(500, {'Content-Type':'text/plain'});
	    response.write("<h1>500 Server Error: Hong Gan Liao!</h1>");
	    response.end();
	}
	else {
	    response.writeHead(500, { 'Content-Type':'text/html' });
	    response.write(content, 'utf-8');
	    response.end();
	}
    });

}

exports.index = index;
exports.sync = sync;
exports.resources = resources;
exports._404Handler = _404Handler;
exports._500Handler = _500Handler;