var daemon = require('daemon');
var router = require('./router');
var server = require('./server');
var requestHandler = require('./requestHandler');
var fs = require('fs');

var handle = {};
handle['/'] = requestHandler.index;
handle['/index'] = requestHandler.index;
handle['/sync'] = requestHandler.sync;

console.log(router);
console.log(server);
server.start(router.route, handle);

fs.open('crowd.log', 'w+', function (err, fd) {
    daemon.start(fd);
    console.log('crowd daemon successfully started!');
    daemon.lock('/tmp/crowd.pid');
});