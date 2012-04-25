/*
   Schedule things to happen at certain times

   By Thomas Levine, standing on the substantial shoulders
   of his group at the HTML5 Hackathon at Google Kirkland

   ----

   Copyright 2011, Thomas Levine
   Distributed under the terms of the GNU Affero General Public License

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Affero General Public License for more details.

   You should have received a copy of the GNU Affero General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

at = {
   //The queue
  'atq':{}
, 'DEFAULTS':{
    'PRECISION':8
  }
, 'dateToString':function(date) {
    return date.getTime()+'';
  }

   //Low-level interface for saving the function in the queue
, '_set':function(func,time,signedprecision){
      time.setTime(time.getTime()+signedprecision);
      var d = this.dateToString(time);
      this.atq[d] = func;
    }

   //User interface for saving the function in the queue
, 'at':function (func, time, precision) {
    //If a timestamp is given instead of a Date
    if (!time.getSeconds) {
      var tmp = new Date();
      tmp.setTime(time);
      time = tmp;
    }
    if (typeof(precision)==='undefined'){
      //How far away from the exact time is acceptable?
      //Use a number in milliseconds
      var precision=this.DEFAULTS.PRECISION;
    }

    //Add to the queue
    /* Daemon
    var p=0-Math.abs(precision);
    var p_end=Math.abs(precision);
    for (p;p<=precision;p++){
      this._set(func,time,p);
    }
    */
    //No daemon
    setTimeout(func,time.getTime()-new Date().getTime());
  }

, 'atd': function(thisAT) { //Daemon
    //thisAT just sends this to atd when it's run with setTimeout
    if (typeof(thisAT)==='undefined'){
      var thisAT=this;
    }

    var date = new Date();
    var d = thisAT.dateToString(date);
    var alarm = thisAT.atq[d];

    if (alarm) {
      alarm();
    }

    // Run again
    setTimeout(function(){
      thisAT.atd(thisAT);
    },1);
  }
}
//at.atd();
