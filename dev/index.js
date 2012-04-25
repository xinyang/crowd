var router = require('./router');
var server = require('./server');
var requestHandler = require('./requestHandler');

var handle = {};
handle['/'] = requestHandler.index;
handle['/index'] = requestHandler.index;
handle['/sync'] = requestHandler.sync;

console.log(router);
console.log(server);
server.start(router.route, handle);