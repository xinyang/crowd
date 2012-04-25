/*
   Synchronize your browser with a server.
   Inspired by Network Time Protocol

   By Thomas Levine, standing on the substantial shoulders
   of his group at the HTML5 Hackathon at Google Kirkland

   ----

   Copyright 2011, Thomas Levine
   Distributed under the terms of the GNU Affero General Public License

   This file is part of ntpjs.

   ntpjs is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   ntpjs is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Affero General Public License for more details.

   You should have received a copy of the GNU Affero General Public License
   along with ntpjs.  If not, see <http://www.gnu.org/licenses/>.
*/

module.exports={
  'WEBDIR':'ntp'
, 'SRVDIR': './node_modules/ntp/static'
, 'JS':{
    'ntp.js':1
  , 'at.js':1
  }

, 'listen':function (app) {
    this.io = require('socket.io').listen(app);
    this.fs = require('fs');
    this.path = require('path');

    this.io.sockets.on('connection', function (socket) {
      socket.on('message', function (clientTime) {
        socket.send(new Date().getTime()+':'+clientTime);
      });
    });
  }

, 'static':function (request,response,yourstuff) {
      //If the ntp directory is requested, do something
      var clientPath=request.url.split('/');
      if (clientPath[1]===this.WEBDIR){
        var JS=clientPath[2];
        if (JS in this.JS) {
          var filePath = this.SRVDIR+'/'+JS;
          this.fs.readFile(filePath, function(error, content) {
            if (error) {
              response.writeHead(500);
              response.end('Oops. The ntp.js installation is apparently messed up.');
            } else {
              response.writeHead(200, {'Content-Type':'text/javascript'});
              response.end(content, 'utf-8');
            }
          });
        } else {
          response.writeHead(500);
          response.end('Welcome to ntp.js');
        }
      } else {
        //This is a hack because I don't know the right way to do it.
        yourstuff(request,response);
      }
    }

,'save_stats':function(request,response){
    //Define models and connect
    var mongoose = require('mongoose');
    mongoose.connect('mongodb://localhost/papio'); 
    var Schema = mongoose.Schema
    var SyncStatsSchema = new Schema({
        'clientSend':Date
      , 'server':Date
      , 'clientReceive':Date
      , 'clientId':String
    });
    var SyncStats = mongoose.model('SyncStats', SyncStatsSchema);

    //Read data
    console.log(request);
    var this_sync = new SyncStats(request);
  }

}

