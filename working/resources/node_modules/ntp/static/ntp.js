/*
   Synchronize your browser with a server.
   Inspired by Network Time Protocol

   By Thomas Levine, standing on the substantial shoulders
   of his group at the HTML5 Hackathon at Google Kirkland,
   and inspired partly by Jehiah Czebotar's ntp-for-javascript
   http://jehiah.cz/a/ntp-for-javascript

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

ntp={
  'roundtrips':new Array()
, 'math':{
    /*
       Math for averaging
    */
    'compare':function(a,b){
        return a-b;
      }
  , 'median':function(list){
      list.sort(this.compare);
      var listlength = list.length;
      if (listlength % 2){
        var odd = (listlength / 2 - .5);
        return list[odd];
      }else{
        var even = (list[listlength / 2]);
        even += (list[listlength  / 2 + 1]);
        even = (even / 2);
        return even;
      }
    }
  , 'mean':function(list){
      var average = 0;
      var i=0;
      for (i=0; i < list.length;i++){
        average += list[i];
      }
      average = Math.round(average / i);
      return average
    }
  , 'min':function(list){
      var min=Infinity;
      var i=0;
      for (i=0; i < list.length;i++){
        if (list[i]<min){
          min=list[i];
//          console.log(min);
        }
      }
      return min;
    }
  , 'sort':function(list){
      //Something's very wrong with this.
      //I think Array.sort modifies state.
      return (function(){return list})().sort(function(a,b) {
        return a - b;
      });
    }
  }

, 'setup':function(trips){
    /*
       Prepare for syncing
    */
    this.tripsSoFar=0;

    //Defaults
    if (typeof(trips)==='undefined'){
      trips=100;
    }
    this.trips=trips;

    this.socket = io.connect();
    this.socket.on('connect', function(){
      //log('connected');
    });

  }

, 'sync':function(callback,trips){
    if (typeof(callback)==='undefined'){
      throw 'No callback to be run after syncing is defined.';
    }
    this.setup();

    var thisNTP=this;
    this.socket.on('message', function(times){
      clientReceive=new Date().getTime();
      server=parseInt(times.split(":")[0]);
      clientSend=parseInt(times.split(":")[1]);
      
      lastOffset=(clientReceive+clientSend)/2-server;

      thisNTP.roundtrips.push({
        'clientSend':clientSend
      , 'server':server
      , 'clientReceive':clientReceive
      });

      thisNTP.tripsSoFar++;
      if (thisNTP.tripsSoFar < thisNTP.trips){
        thisNTP.socket.send(new Date().getTime());
      } else {
        callback();
/*
        //Send statistics to the server
        $.post("/stats",thisNTP.roundtrips,function(){
          console.log($(this))
        });
*/
      }
    });
    this.socket.send(new Date().getTime());
  }

, '_date':function(adjust){
    return function(dateIn){
      /*
         Get the date of the server that
         corresponds to a client date.
      */
      tmp=new Date();
      if (typeof(dateIn)==='undefined'){
        //Use now if no date is specified
      } else if (typeof(dateIn)==='number'){
        tmp.setTime(dateIn);
      } else if (typeof(dateIn)==='object'){
        tmp.setTime(dateIn.getTime());
      }
      tmp.setTime(tmp.getTime()+adjust);
      return tmp;
    }
  }
, 'clientDate':function(serverDate){
    if (typeof(serverDate)==='undefined'){
      return new Date();
    } else {
      return this._date(this.offset())(serverDate);
    }
  }
, 'serverDate':function(clientDate){
    return this._date(-1*this.offset())(clientDate);
  }
, 'best':function(){
    var delays=this.roundtrips.map(this.stats.delay)
    var lowDelay=this.math.min(delays);
//    console.log(delays);
//    console.log(lowDelay);
    var i=0;
    var bestTrips=[]; //Trips with low delay
    for (i=0;i<delays.length;i++){
      if (delays[i]===lowDelay){
        bestTrips.push(this.roundtrips[i]);
//        console.log(ntp.stats.delay(bestTrips[bestTrips.length-1])+' should be '+lowDelay);
      }
    }
//    console.log('Best delay: '+lowDelay);
    return bestTrips;
  }
, 'offset':function(){
    return this.math.mean(this.best().map(this.stats.offset));
  }
, 'stats':{
    //Round-trip length
    'delay':function(trip) {
      return (trip.clientReceive-trip.clientSend);
    }
  , 'offset':function(trip){
      return (trip.clientReceive+trip.clientSend)/2-trip.server;
    }
  , 'all':function(trips) {
      //Save delay and offset to csv
      var _this=this;
      return ['clientSend,server,clientReceive,delay,offset'].concat(trips.map(function(trip){
        return trip.clientSend+','+trip.server+','+trip.clientReceive+','+_this.delay(trip)+','+_this.offset(trip);
      }));
    }
  }

} //End of the ntp json
