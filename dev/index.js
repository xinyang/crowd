var PORT = 8000;

var router = require('./router');
var server = require('./server');
var requestHandler = require('./requestHandler');

var handle = {};
handle['/'] = requestHandler.index;
handle['/index'] = requestHandler.index;
handle['/sync'] = requestHandler.sync;

server.start(router.route, handle, PORT);