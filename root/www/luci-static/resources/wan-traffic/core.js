'use strict';
'require baseclass';

function shift(date, offset) {
 var p = date.split('-').map(Number);
 var d = new Date(Date.UTC(p[0], p[1] - 1, p[2] + offset));
 return d.toISOString().slice(0, 10);
}
function cycle(date, day) {
 var p = date.split('-').map(Number), y = p[0], m = p[1];
 if (p[2] < day) { m--; if (!m) { m = 12; y--; } }
 return y + '-' + ('0' + m).slice(-2) + '-' + ('0' + day).slice(-2);
}
function sum(rows, start, end) {
 return rows.reduce(function(a, r) {
  if ((!start || r.date >= start) && r.date <= end) { a.rx += Number(r.rx) || 0; a.tx += Number(r.tx) || 0; }
  return a;
 }, { rx: 0, tx: 0 });
}
function volume(row, mode) { return mode==='download'?row.rx:mode==='upload'?row.tx:row.rx+row.tx; }
function diffDays(a,b) {return (Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/86400000;}
return baseclass.extend({
 shift: shift,
 cycle: cycle,
 volume: volume,
 speed: function(n, unit) {return unit==='bits'?(n*8/1000000).toFixed(2)+' Mbps':this.bytes(n)+'/s';},
 analyze: function(data, day, quota, mode) {
  var today=data.date, rows=data.days, hours=data.hours||[], rates=data.rates||[], start=cycle(today,day);
  var p=start.split('-').map(Number), end=new Date(Date.UTC(p[0],p[1],p[2])).toISOString().slice(0,10);
  var totals=sum(rows,start,today), daily=rows.filter(function(r){return r.date<today && r.date>=shift(today,-7);});
  var weekdays=Array.from({length:7},function(){return {rx:0,tx:0,count:0};});
  var bins=Array.from({length:24},function(){return {rx:0,tx:0,seconds:0};});
  var peakRx=0,peakTx=0,packets=0,errors=0,drops=0,coverage=0,hourSamples=0;
  hours.forEach(function(r){
   var date=r.hour.slice(0,10);if(date>today || date<shift(today,-6))return;
   hourSamples++;
   var h=Number(r.hour.slice(11,13));if(h>=0 && h<24){bins[h].rx+=r.rx;bins[h].tx+=r.tx;bins[h].seconds+=r.seconds;}
   peakRx=Math.max(peakRx,r.peak_rx||0);peakTx=Math.max(peakTx,r.peak_tx||0);coverage+=r.seconds||0;
   if(date===today){packets+=(r.rx_packets||0)+(r.tx_packets||0);errors+=r.errors||0;drops+=r.drops||0;}
  });
  var recent=rows.filter(function(r){return r.date>=shift(today,-29) && r.date<=today;});
  recent.forEach(function(r){var d=new Date(r.date+'T00:00:00Z').getUTCDay();weekdays[d].rx+=r.rx;weekdays[d].tx+=r.tx;weekdays[d].count++;});
  var completed=recent.filter(function(r){return r.date<today;});
  var top=recent.slice().sort(function(a,b){return b.rx+b.tx-a.rx-a.tx;}).slice(0,5);
  var keys={};rows.forEach(function(r){keys[r.date]=true;});
  var comparisonReady=true;for(var i=0;i<14;i++){if(!keys[shift(today,-i)])comparisonReady=false;}
  var previous=sum(rows,shift(today,-13),shift(today,-7)), current=sum(rows,shift(today,-6),today);
  var previousBytes=previous.rx+previous.tx,change=comparisonReady && previousBytes>0?((current.rx+current.tx)/previousBytes-1)*100:null;
  var time=(data.time||'00:00:00').split(':').map(Number), fraction=(time[0]*3600+time[1]*60+time[2])/86400;
  var remaining=Math.max(0,diffDays(today,end)-fraction), used=volume(totals,mode), average=daily.length?daily.reduce(function(a,r){return a+volume(r,mode);},0)/daily.length:0;
  var forecast=daily.length>=3?used+average*remaining:null;
  var now=data.live.timestamp||Date.now()/1000;
  var speeds=rates.filter(function(r){return r.timestamp>=now-900 && r.timestamp<=now;}).map(function(r){return r.rx+r.tx;}).sort(function(a,b){return a-b;});
  var p95=speeds.length>=20?speeds[Math.max(0,Math.ceil(speeds.length*.95)-1)]:null;
  return {end:end,remaining:remaining,used:used,quota:quota,forecast:forecast,forecastDays:daily.length,average:average,
   change:change,top:top,weekdays:weekdays,bins:bins,peakRx:peakRx,peakTx:peakTx,packets:packets,errors:errors,drops:drops,coverage:coverage,p95:p95,hourSamples:hourSamples,
   dayAverage:completed.length?completed.reduce(function(a,r){return a+r.rx+r.tx;},0)/completed.length:0,completedDays:completed.length,
   uploadShare:current.rx+current.tx?current.tx/(current.rx+current.tx)*100:0};
 },
 bytes: function(n) {
  n = Number(n) || 0;
  var units = ['B', 'KiB', 'MiB', 'GiB', 'TiB'], i = 0;
  while (n >= 1024 && i < 4) { n /= 1024; i++; }
  return n.toFixed(i ? 2 : 0) + ' ' + units[i];
 },
 summarize: function(rows, today, day) {
  return {today:sum(rows,today,today),week:sum(rows,shift(today,-6),today),
   month:sum(rows,shift(today,-29),today),total:sum(rows,null,today),
   cycle:sum(rows,cycle(today,day),today),start:cycle(today,day)};
 },
 series: function(rows, today, days) {
  var byDate = {}; rows.forEach(function(r){byDate[r.date]=r;});
  var result = [];
  for (var i = days - 1; i >= 0; i--) {
   var date = shift(today, -i), r = byDate[date];
   result.push({date:date,rx:r ? Number(r.rx) : 0,tx:r ? Number(r.tx) : 0,recorded:!!r});
  }
  return result;
 }
});
