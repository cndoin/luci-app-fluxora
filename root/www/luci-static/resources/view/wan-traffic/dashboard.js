'use strict';
'require view';
'require fs';
'require uci';
'require form';
'require poll';
'require wan-traffic.core as core';
'require wan-traffic.i18n as i18n';

var language='zh-CN';
function tr(text){return i18n.t(language,text);}

function softMotion(node, frames) {
 var root=node.closest && node.closest('.wt-root');
 if(!node.isConnected || !node.animate || !root || root.dataset.motion==='off' || window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 node.getAnimations().forEach(function(a){a.cancel();});
 node.animate(frames,{duration:320,easing:'cubic-bezier(.22,1,.36,1)'});
}
function syncNode(oldNode,newNode) {
 if(oldNode.nodeType!==newNode.nodeType || oldNode.nodeName!==newNode.nodeName){oldNode.replaceWith(newNode);return;}
 if(oldNode.nodeType===3){
  if(oldNode.nodeValue!==newNode.nodeValue){oldNode.nodeValue=newNode.nodeValue;
   if(oldNode.parentElement && oldNode.parentElement.tagName==='STRONG' && /\d/.test(newNode.nodeValue))softMotion(oldNode.parentElement,[{opacity:.55,transform:'translateY(3px)'},{opacity:1,transform:'translateY(0)'}]);
  }return;
 }
 if(oldNode.nodeType!==1)return;
 Array.from(oldNode.attributes).forEach(function(a){if(!newNode.hasAttribute(a.name))oldNode.removeAttribute(a.name);});
 Array.from(newNode.attributes).forEach(function(a){if(oldNode.getAttribute(a.name)!==a.value){oldNode.setAttribute(a.name,a.value);if(a.name==='d')softMotion(oldNode,[{opacity:.65},{opacity:1}]);}});
 var oldChildren=Array.from(oldNode.childNodes), newChildren=Array.from(newNode.childNodes);
 newChildren.forEach(function(n,i){if(oldChildren[i])syncNode(oldChildren[i],n);else oldNode.appendChild(n);});
 oldChildren.slice(newChildren.length).forEach(function(n){n.remove();});
}
function replaceStable(container) {
 var nodes=Array.prototype.slice.call(arguments,1), old=Array.from(container.childNodes);
 nodes.forEach(function(n,i){if(old[i])syncNode(old[i],n);else container.appendChild(n);});
 old.slice(nodes.length).forEach(function(n){n.remove();});
}

function svg(tag, attrs, children) {
 var node = document.createElementNS('http://www.w3.org/2000/svg', tag);
 Object.keys(attrs || {}).forEach(function(k) { node.setAttribute(k, attrs[k]); });
 (children || []).forEach(function(c) { node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
 return node;
}
function areaChart(series, options) {
 options=options||{};
 var compact=window.innerWidth<600;
 var w=compact?480:900, h=265, left=72, right=18, top=15, bottom=35, cw=w-left-right, ch=h-top-bottom;
 var max=Math.max.apply(null,[1].concat(series.map(function(r){return Math.max(r.rx,r.tx);} )));
 function xAt(i) {return left+(options.speed?(series[i].timestamp-series[0].timestamp)/Math.max(1,series[series.length-1].timestamp-series[0].timestamp):i/Math.max(series.length-1,1))*cw;}
 var metric=options.speed?function(n){return core.speed(n,options.unit);}:core.bytes;
 var id=options.speed?'speed':'daily';
 var node=svg('svg',{viewBox:'0 0 '+w+' '+h,role:'img','aria-label':options.speed?tr('最近十五分钟速率'):tr('每日上传下载流量趋势'),'class':'wt-svg'});
 node.appendChild(svg('defs',{},['rx','tx'].map(function(key){return svg('linearGradient',{id:'wt-'+id+'-'+key,x1:0,y1:0,x2:0,y2:1},[
  svg('stop',{offset:'0%', 'stop-color':key==='rx'?'#14b8a6':'#8b5cf6','stop-opacity':'.28'}),
  svg('stop',{offset:'100%', 'stop-color':key==='rx'?'#14b8a6':'#8b5cf6','stop-opacity':'.01'})
 ]);} )));
 for (var i=0;i<5;i++) {
  var y=top+ch*(1-i/4);
  node.appendChild(svg('line',{x1:left,y1:y,x2:w-right,y2:y,'class':'wt-grid'}));
  node.appendChild(svg('text',{x:left-10,y:y+4,'text-anchor':'end','class':'wt-axis'},[metric(max*i/4)]));
 }
 ['tx','rx'].forEach(function(key){
  var segments=[],segment=[];series.forEach(function(r,i){if(options.speed && i && r.timestamp-series[i-1].timestamp>15){segments.push(segment);segment=[];}segment.push(i);});if(segment.length)segments.push(segment);
  segments.forEach(function(indices){var path=indices.map(function(i,j){return (j?'L':'M')+xAt(i).toFixed(2)+','+(top+ch-series[i][key]/max*ch).toFixed(2);}).join(' ');
   node.appendChild(svg('path',{d:path+' L'+xAt(indices[indices.length-1])+','+(top+ch)+' L'+xAt(indices[0])+','+(top+ch)+' Z',fill:'url(#wt-'+id+'-'+key+')'}));
   node.appendChild(svg('path',{d:path,fill:'none',stroke:key==='rx'?'#14b8a6':'#8b5cf6','stroke-width':key==='rx'?2.5:1.8}));
  });
 });
 series.forEach(function(r,i){
  var x=xAt(i);
  if(i===0 || i===series.length-1 || i%Math.ceil(series.length/(compact?3:6))===0)
   node.appendChild(svg('text',{x:x,y:h-9,'text-anchor':'middle','class':'wt-axis'},[options.speed?r.label:r.date.slice(5)]));
  node.appendChild(svg('rect',{x:x-cw/series.length/2,y:top,width:cw/series.length,height:ch,fill:'transparent'},[
   svg('title',{},[r.date+' · ↓ '+metric(r.rx)+' · ↑ '+metric(r.tx)+(r.recorded?'':tr(' · 无记录'))])
  ]));
 });
 return node;
}
function sparkline(rows) {
 var max=Math.max.apply(null,[1].concat(rows.map(function(r){return r.rx+r.tx;})));
 return svg('svg',{viewBox:'0 0 120 28','class':'wt-spark','aria-hidden':'true'},[svg('path',{d:rows.map(function(r,i){return (i?'L':'M')+(i/Math.max(1,rows.length-1)*120).toFixed(1)+','+(26-(r.rx+r.tx)/max*24).toFixed(1);}).join(' '),fill:'none',stroke:'currentColor','stroke-width':1.7})]);
}
function card(label, data, badge, detail, series) {
 return E('div',{'class':'wt-card'},[
  E('div',{'class':'wt-card-top'},[E('span',{},label),E('span',{'class':'wt-badge'},badge)]),
  E('strong',{},core.bytes(data.rx+data.tx)),
  E('div',{'class':'wt-split'},[E('span',{},'↓ '+core.bytes(data.rx)),E('span',{},'↑ '+core.bytes(data.tx))]),
  E('small',{},detail),series?sparkline(series):E('span')
 ]);
}
return view.extend({
 load:function(){return Promise.all([uci.load('wan_traffic'),uci.load('luci')]).then(function(){return [null,{devices:[]}];});},
 render:function(loaded){
  language=i18n.language(uci.get('wan_traffic','main','language'),uci.get('luci','main','lang'),navigator.language);
  var m=new form.Map('wan_traffic',tr('手动配置'),tr('配置永久保存。固定设备优先于逻辑接口，留空则从逻辑接口自动识别；配置应用后下一次采样生效。'));
  var s=m.section(form.NamedSection,'main','settings');
  var o=s.option(form.Value,'device',tr('统计网口（固定设备）'));o.placeholder=tr('自动识别；推荐 eth0');
  (loaded[1].devices || []).forEach(function(d){o.value(d,d+(d==='eth0'?tr(' · 当前外网口'):''));});
  o.validate=function(section,value){return !value || /^[a-zA-Z0-9_.:-]+$/.test(value) || tr('请输入单个有效网口名称');};
  o.description=tr('只选一个外网设备，勿将 wan、wan6、TUN 或 LAN 数据相加。留空自动识别，也可输入自定义设备名。');
  o=s.option(form.Value,'interface',tr('自动识别使用的逻辑接口'));o.default='wan';o.rmempty=false;o.datatype='uciname';
  o=s.option(form.ListValue,'reset_day',tr('每月账期开始日'));
  for(var i=1;i<=28;i++)o.value(String(i),tr('每月 ')+i+tr(' 日'));o.default='1';
  o=s.option(form.ListValue,'save_interval',tr('磁盘保存间隔'));
  [['60',tr('1 分钟')],['300',tr('5 分钟')],['600',tr('10 分钟')],['1800',tr('30 分钟')]].forEach(function(x){o.value(x[0],x[1]);});o.default='60';
  o=s.option(form.Flag,'allow_virtual',tr('允许统计虚拟接口（高级）'));o.default='0';
  o.description=tr('默认拒绝常见 TUN、桥接和容器接口。只有明确需要统计虚拟接口时开启；开启后仍只统计一个设备。');
  o=s.option(form.Value,'quota_gib',tr('每账期流量额度（GiB）'));o.datatype='ufloat';o.placeholder=tr('0：不设置');o.description=tr('用于显示进度与剩余额度，不限速、不阻断网络。1 GiB = 1024³ 字节。');
  o=s.option(form.ListValue,'quota_mode',tr('额度计费口径'));o.value('both',tr('上传 + 下载'));o.value('download',tr('仅下载'));o.value('upload',tr('仅上传'));o.default='both';
  o=s.option(form.Value,'download_mbps',tr('下载带宽（Mbps）'));o.datatype='ufloat';o.placeholder=tr('0：不显示利用率');
  o=s.option(form.Value,'upload_mbps',tr('上传带宽（Mbps）'));o.datatype='ufloat';o.placeholder=tr('0：不显示利用率');
  o=s.option(form.ListValue,'speed_unit',tr('速率显示单位'));o.value('bytes',tr('KiB / MiB 每秒'));o.value('bits','Mbps');o.default='bytes';
  o=s.option(form.ListValue,'refresh_interval',tr('默认页面刷新间隔'));[['2',tr('2 秒')],['5',tr('5 秒')],['10',tr('10 秒')],['15',tr('15 秒')],['30',tr('30 秒')],['60',tr('60 秒')],['0',tr('仅手动刷新')]].forEach(function(x){o.value(x[0],x[1]);});o.default='5';
  o.description=tr('只影响页面读取频率；后台每 5 秒采样，页面历史数据约每分钟同步一次。页面隐藏时暂停请求。');
  o=s.option(form.ListValue,'motion',tr('界面动画'));o.value('soft',tr('轻柔动画'));o.value('off',tr('关闭动画'));o.default='soft';
  o=s.option(form.ListValue,'language',tr('界面语言'));o.value('auto',tr('跟随 LuCI / 浏览器'));o.value('zh-CN','中文');o.value('en','English');o.value('ja','日本語');o.default='auto';
  var root=E('div',{'class':'wt-root'}), status=E('span',{'class':'wt-status'},tr('读取中'));
  var cards=E('div',{'class':'wt-cards'}), details=E('div',{'class':'wt-details'});
  var chart=E('div',{'class':'wt-chart-body'}), subtitle=E('p',{'class':'wt-muted'});
  var records=E('div',{'class':'wt-records'}), settings=E('div',{'class':'wt-settings'});
  var insight=E('div',{'class':'wt-insight-row'}), budget=E('section',{'class':'wt-panel wt-budget'}), mix=E('section',{'class':'wt-panel wt-mix'});
  var real=E('section',{'class':'wt-panel wt-realtime'}), hourly=E('section',{'class':'wt-panel wt-hourly'});
  var calendar=E('section',{'class':'wt-panel wt-calendar'}), ranking=E('section',{'class':'wt-panel wt-ranking'}), health=E('section',{'class':'wt-panel wt-health'});
  var range=30, page=0, recordMode='daily', latest=null, settingsOpen=false, selectedDate=null;
  var refreshSeconds=Number(uci.get('wan_traffic','main','refresh_interval') || '5');
  if([0,2,5,10,15,30,60].indexOf(refreshSeconds)<0)refreshSeconds=5;
  var busy=false,disposed=false,lastFull=0,lastRendered='',pendingTimer=null,mountTimer=null,observer=null;
  var refreshMeta=E('span',{'class':'wt-refresh-meta'},tr('后台 5 秒采样 · 历史每分钟同步'));
  var refreshSelect=E('select',{'class':'wt-refresh-select','aria-label':tr('页面刷新间隔'),change:function(){refreshSeconds=Number(this.value);startPolling();refreshMeta.textContent=refreshSeconds?tr('页面每 ')+refreshSeconds+tr(' 秒刷新 · 后台每 5 秒采样'):tr('自动刷新已暂停 · 后台采样继续');}});
  [2,5,10,15,30,60,0].forEach(function(n){refreshSelect.appendChild(E('option',{value:String(n)},n?tr('每 ')+n+tr(' 秒'):tr('仅手动')));});refreshSelect.value=String(refreshSeconds);
  var refreshButton=E('button',{type:'button','class':'wt-button wt-refresh-button',click:function(){return update(true);}},tr('立即刷新'));
  var toggle=E('button',{type:'button','class':'wt-button',click:function(){settingsOpen=!settingsOpen;settings.hidden=!settingsOpen;toggle.textContent=settingsOpen?tr('收起配置'):tr('手动配置');}},tr('手动配置'));
  var rangeButtons=E('div',{'class':'wt-segments'});
  [7,30,90].forEach(function(days){rangeButtons.appendChild(E('button',{type:'button','class':days===range?'active':'',click:function(){range=days;Array.from(rangeButtons.children).forEach(function(b){b.classList.toggle('active',b===this);},this);paintChart();}},tr('近 ')+days+tr(' 天')));});
  function paintChart(){
   if(!latest)return;
   var series=core.series(latest.days,latest.date,range);
   subtitle.textContent=tr('每日下载与上传 · ')+core.shift(latest.date,1-range)+tr(' 至 ')+latest.date+tr(' · 无记录日期显示为 0');
   replaceStable(chart,areaChart(series),E('div',{'class':'wt-legend'},[E('span',{},tr('━ 下载')),E('span',{},tr('━ 上传')),E('small',{},tr('悬停查看每天数据'))]));
  }
  function paintRecords(){
   if(!latest)return;
   var rows=latest.days.slice(), reset=Number(uci.get('wan_traffic','main','reset_day'))||1;
   if(recordMode!=='daily'){
    var grouped={};rows.forEach(function(r){var key=recordMode==='month'?r.date.slice(0,7):recordMode==='year'?r.date.slice(0,4):core.cycle(r.date,reset);if(!grouped[key])grouped[key]={date:key,rx:0,tx:0};grouped[key].rx+=r.rx;grouped[key].tx+=r.tx;});
    rows=Object.keys(grouped).map(function(k){return grouped[k];});
   }
   rows.sort(function(a,b){return b.date.localeCompare(a.date);});
   var pages=Math.max(1,Math.ceil(rows.length/10));page=Math.min(page,pages-1);
   var tab=E('div',{'class':'wt-segments'});
   [['daily',tr('每日记录')],['cycle',tr('历史账期')],['month',tr('自然月')],['year',tr('年度')]].forEach(function(pair){tab.appendChild(E('button',{type:'button','class':recordMode===pair[0]?'active':'',click:function(){recordMode=pair[0];page=0;paintRecords();}},pair[1]));});
   var table=E('table',{'class':'wt-table'},[E('thead',{},[E('tr',{},[recordMode==='daily'?tr('日期'):recordMode==='cycle'?tr('账期开始'):tr('时间'),tr('下载'),tr('上传'),tr('总流量')].map(function(t){return E('th',{},t);} ))])]);
   var body=E('tbody');rows.slice(page*10,page*10+10).forEach(function(r){body.appendChild(E('tr',{},[r.date,core.bytes(r.rx),core.bytes(r.tx),core.bytes(r.rx+r.tx)].map(function(t){return E('td',{},t);})));});
   if(!rows.length)body.appendChild(E('tr',{},[E('td',{colspan:4},tr('暂无记录，服务启动后自动开始统计'))]));table.appendChild(body);
   records.replaceChildren(E('div',{'class':'wt-panel-head'},[E('h3',{},tr('流量记录')),tab]),E('div',{'class':'wt-table-wrap'},table),
    E('div',{'class':'wt-pagination'},[E('span',{},tr('共 ')+rows.length+tr(' 条 · 第 ')+(page+1)+' / '+pages+tr(' 页')),E('div',{},[
     E('button',{type:'button','class':'wt-button',disabled:page===0,click:function(){page--;paintRecords();}},tr('上一页')),
     E('button',{type:'button','class':'wt-button',disabled:page>=pages-1,click:function(){page++;paintRecords();}},tr('下一页'))
    ])]));
  }
  function paintInsights(sums,live,active,slow){
   var unit=uci.get('wan_traffic','main','speed_unit')||'bytes', mode=uci.get('wan_traffic','main','quota_mode')||'both';
   var quota=(Number(uci.get('wan_traffic','main','quota_gib'))||0)*1073741824;
   var a=core.analyze(latest,Number(uci.get('wan_traffic','main','reset_day'))||1,quota,mode);
   function metric(label,value,foot){return E('div',{'class':'wt-insight'},[E('small',{},label),E('strong',{},value),E('span',{},foot)]);}
   if(slow){
   replaceStable(insight,metric(tr('近 7 天变化'),a.change===null?tr('数据积累中'):(a.change>=0?'+':'')+a.change.toFixed(1)+'%',tr('对比前 7 天 · 今天尚未结束')),metric(tr('日均流量'),core.bytes(a.dayAverage),tr('近 30 天内 ')+a.completedDays+tr(' 个已记录结束日')),metric(tr('高用量日'),a.top.length?a.top[0].date:tr('暂无记录'),a.top.length?core.bytes(a.top[0].rx+a.top[0].tx):tr('开始记录后自动统计')),metric(tr('上传占比'),a.uploadShare.toFixed(1)+'%',tr('近 7 天 · 上传 / 总流量')));
   var pct=quota?a.used/quota*100:0;
   replaceStable(budget,E('div',{'class':'wt-panel-head'},[E('div',{},[E('h3',{},tr('账期与流量预算')),E('p',{'class':'wt-muted'},sums.start+' — '+core.shift(a.end,-1))]),E('span',{'class':'wt-badge'},tr('剩余 ')+Math.ceil(a.remaining)+tr(' 天'))]),
    E('div',{'class':'wt-budget-body'},[E('div',{'class':'wt-budget-main'},[E('strong',{},core.bytes(a.used)),E('span',{'class':'wt-muted'},quota?' / '+core.bytes(quota):tr(' · 未设置额度'))]),
     E('div',{'class':'wt-progress'},E('i',{'style':'width:'+Math.min(100,pct)+'%;'+(pct>=100?'background:#f43f5e':pct>=80?'background:#f59e0b':'')})),
     E('div',{'class':'wt-budget-grid'},[metric(tr('剩余额度'),quota?core.bytes(Math.max(0,quota-a.used)):tr('可在手动配置中设置'),quota?tr('已使用 ')+pct.toFixed(1)+'%':tr('额度只用于提醒')),metric(tr('账期末预计'),a.forecast===null?tr('等待更多数据'):core.bytes(a.forecast),tr('按近 7 天内 ')+a.forecastDays+tr(' 个结束日均值估算'))]),
     E('p',{'class':'wt-muted'},tr('计费口径：')+(mode==='download'?tr('仅下载'):mode==='upload'?tr('仅上传'):tr('上传 + 下载'))+tr('。预测需至少 3 个已记录结束日，仅供参考。')+(quota && a.forecast>quota?tr('按近期用量预计将超过额度。'):''))]));
   var week=sums.week, share=week.rx+week.tx?week.rx/(week.rx+week.tx)*100:0;
   replaceStable(mix,E('div',{'class':'wt-panel-head'},[E('h3',{},tr('流量方向')),E('span',{'class':'wt-badge'},tr('近 7 天'))]),E('div',{'class':'wt-mix-body'},[
    E('div',{'class':'wt-donut','style':'--wt-share:'+share+'%;background:'+(week.rx+week.tx?'conic-gradient(#14b8a6 0 var(--wt-share),#8b5cf6 var(--wt-share) 100%)':'var(--wt-border)')},E('div',{},[E('small',{},tr('总流量')),E('strong',{},core.bytes(week.rx+week.tx))])),
    E('div',{'class':'wt-mix-labels'},[metric(tr('↓ 下载'),core.bytes(week.rx),share.toFixed(1)+'%'),metric(tr('↑ 上传'),core.bytes(week.tx),a.uploadShare.toFixed(1)+'%')])
   ]));
   }
   var rates=(latest.rates||[]).filter(function(r){return r.timestamp>=(live.timestamp||Date.now()/1000)-900;}).map(function(r){var d=new Date(r.timestamp*1000);return {timestamp:r.timestamp,date:d.toLocaleTimeString(),label:d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}),rx:r.rx,tx:r.tx,recorded:true};});
   replaceStable(real,E('div',{'class':'wt-panel-head'},[E('div',{},[E('h3',{},tr('速率脉搏')),E('p',{'class':'wt-muted'},tr('最近 15 分钟 · 5 秒平均速率 · 重启后重新积累'))]),E('span',{'class':'wt-live-pill'},active?'LIVE':tr('等待采样'))]),E('div',{'class':'wt-chart-body'},rates.length>1?areaChart(rates,{speed:true,unit:unit}):E('p',{'class':'wt-empty'},tr('正在积累速率记录…'))),
    E('div',{'class':'wt-speed-stats'},[metric(tr('近 7 天下载峰值'),a.hourSamples?core.speed(a.peakRx,unit):tr('等待采集'),tr('采样间隔平均值')),metric(tr('近 7 天上传峰值'),a.hourSamples?core.speed(a.peakTx,unit):tr('等待采集'),tr('采样间隔平均值')),metric(tr('15 分钟 P95 合计速率'),a.p95===null?tr('等待 20 个样本'):core.speed(a.p95,unit),tr('采样分位数，不是运营商计费 95 峰值'))]));
   if(slow){
   var largest=Math.max.apply(null,[1].concat(a.bins.map(function(r){return r.rx+r.tx;})));
   var bars=E('div',{'class':'wt-hour-bars'});
   a.bins.forEach(function(r,i){bars.appendChild(E('div',{'class':'wt-hour-col','title':('0'+i).slice(-2)+':00 · ↓ '+core.bytes(r.rx)+' · ↑ '+core.bytes(r.tx)+tr(' · 已采样 ')+Math.round(r.seconds/60)+tr(' 分钟')},[E('div',{'class':'wt-hour-stack'},[E('i',{'class':'rx','style':'height:'+(r.rx/largest*100)+'%'}),E('i',{'class':'tx','style':'height:'+(r.tx/largest*100)+'%'})]),E('small',{},i%4===0?('0'+i).slice(-2):'')]));});
   var weekday=E('div',{'class':'wt-weekday'});
   var weekdayMax=Math.max.apply(null,[1].concat(a.weekdays.map(function(r){return r.count?(r.rx+r.tx)/r.count:0;})));
   [1,2,3,4,5,6,0].forEach(function(i){var r=a.weekdays[i],avg=r.count?(r.rx+r.tx)/r.count:0;weekday.appendChild(E('div',{'title':tr('周')+[tr('日'),tr('一'),tr('二'),tr('三'),tr('四'),tr('五'),tr('六')][i]+tr(' · 已记录 ')+r.count+tr(' 天 · 日均 ')+core.bytes(avg)},[E('span',{},tr('周')+[tr('日'),tr('一'),tr('二'),tr('三'),tr('四'),tr('五'),tr('六')][i]),E('div',{'class':'wt-progress'},E('i',{'style':'width:'+(avg/weekdayMax*100)+'%'})),E('small',{},r.count?core.bytes(avg):tr('无记录'))]));});
   replaceStable(hourly,E('div',{'class':'wt-panel-head'},[E('div',{},[E('h3',{},tr('什么时候最忙？')),E('p',{'class':'wt-muted'},tr('近 7 天按小时累计 · 小时统计从升级后开始'))])]),E('div',{'class':'wt-chart-body'},[bars,E('div',{'class':'wt-legend'},[E('span',{},tr('━ 下载')),E('span',{},tr('━ 上传'))]),E('h4',{'class':'wt-weekday-title'},tr('一周的节奏 · 近 30 天已记录日均（含今日）')),weekday]));
   var calendarRows=core.series(latest.days,latest.date,91), maximum=Math.max.apply(null,[1].concat(calendarRows.map(function(r){return r.rx+r.tx;})));
   var cells=E('div',{'class':'wt-heatmap'}),selected=E('div',{'class':'wt-calendar-selected'});
   function selectDate(r){selectedDate=r.date;selected.replaceChildren(E('strong',{},r.date),E('span',{},r.recorded?'↓ '+core.bytes(r.rx)+'　↑ '+core.bytes(r.tx):tr('此日期没有记录')));Array.from(cells.children).forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-date')===r.date?'true':'false');});}
   calendarRows.forEach(function(r){var level=!r.recorded?-1:r.rx+r.tx===0?0:Math.max(1,Math.ceil((r.rx+r.tx)/maximum*4));cells.appendChild(E('button',{type:'button','class':'wt-heat-cell level-'+level,'data-date':r.date,title:r.date+' · '+(r.recorded?'↓ '+core.bytes(r.rx)+' / ↑ '+core.bytes(r.tx):tr('无记录')),'aria-label':r.date+' '+(r.recorded?core.bytes(r.rx+r.tx):tr('无记录')),click:function(){selectDate(r);}}));});
   selectDate(calendarRows.find(function(r){return r.date===selectedDate;})||calendarRows[calendarRows.length-1]);
   calendar.replaceChildren(E('div',{'class':'wt-panel-head'},[E('div',{},[E('h3',{},tr('用量日历')),E('p',{'class':'wt-muted'},tr('最近 91 天 · 从左到右逐日排列，点击查看'))])]),E('div',{'class':'wt-calendar-body'},[cells,E('div',{'class':'wt-heat-legend'},[E('span',{},tr('无记录')),E('i',{'class':'wt-heat-cell level--1'}),E('span',{},tr('低')),E('i',{'class':'wt-heat-cell level-1'}),E('i',{'class':'wt-heat-cell level-2'}),E('i',{'class':'wt-heat-cell level-3'}),E('i',{'class':'wt-heat-cell level-4'}),E('span',{},tr('高'))]),selected]));
   var ranked=E('div',{'class':'wt-rank-list'});
   a.top.forEach(function(r,i){ranked.appendChild(E('div',{'class':'wt-rank-row'},[E('span',{'class':'wt-rank-num'},String(i+1)),E('div',{},[E('strong',{},r.date),E('small',{},'↓ '+core.bytes(r.rx)+' / ↑ '+core.bytes(r.tx))]),E('b',{},core.bytes(r.rx+r.tx))]));});
   replaceStable(ranking,E('div',{'class':'wt-panel-head'},[E('h3',{},tr('高用量日 TOP 5')),E('span',{'class':'wt-badge'},tr('近 30 天'))]),ranked);
   }
   var utilization=E('div',{'class':'wt-utilization'});
   [['download_mbps',tr('下载'),live.rx_rate],['upload_mbps',tr('上传'),live.tx_rate]].forEach(function(x){var cap=Number(uci.get('wan_traffic','main',x[0]))||0;var percent=cap && active?(x[2]||0)*8/1000000/cap*100:0;utilization.appendChild(E('div',{},[E('div',{'class':'wt-util-title'},[E('span',{},x[1]+tr('带宽利用率')),E('strong',{},cap?percent.toFixed(1)+'%':tr('未配置带宽'))]),E('div',{'class':'wt-progress'},E('i',{'style':'width:'+Math.min(100,percent)+'%'}))]));});
   replaceStable(health,E('div',{'class':'wt-panel-head'},[E('h3',{},tr('接口观察')),E('span',{'class':'wt-badge'},live.device||tr('未连接'))]),E('div',{'class':'wt-health-body'},[utilization,E('div',{'class':'wt-health-grid'},[metric(tr('今日报文'),(a.packets||0).toLocaleString(),tr('发送与接收合计')),metric(tr('今日错误'),String(a.errors),tr('网口驱动计数')),metric(tr('今日丢弃'),String(a.drops),tr('并非端到端丢包率')),metric(tr('近 7 天采样时长'),(a.coverage/3600).toFixed(1)+' h',tr('小时统计从升级后开始'))])]));
  }
  function pollTick(){if(!root.isConnected){dispose();return Promise.resolve();}return update(false);}
  function startPolling(){poll.remove(pollTick);if(!disposed && !document.hidden && refreshSeconds>0)poll.add(pollTick,refreshSeconds);}
  function onVisibility(){if(document.hidden){poll.remove(pollTick);refreshMeta.textContent=tr('页面在后台，已暂停请求 · 流量采样继续');}else if(!disposed){startPolling();update(false);}}
  function onPageHide(event){if(event.persisted)poll.remove(pollTick);else dispose();}
  function onPageShow(event){if(event.persisted && !disposed){startPolling();update(false);}}
  function dispose(){if(disposed)return;disposed=true;poll.remove(pollTick);clearTimeout(pendingTimer);clearTimeout(mountTimer);if(observer)observer.disconnect();document.removeEventListener('visibilitychange',onVisibility);window.removeEventListener('pagehide',onPageHide);window.removeEventListener('pageshow',onPageShow);if(root.getAnimations)root.getAnimations({subtree:true}).forEach(function(a){a.cancel();});}
  function update(forceFull){
   if(disposed || busy || document.hidden)return Promise.resolve();
   busy=true;refreshButton.disabled=true;refreshButton.textContent=tr('刷新中');root.classList.add('wt-refreshing');
   var full=forceFull===true || !latest || Date.now()-lastFull>=60000;
   pendingTimer=setTimeout(function(){if(!disposed){status.textContent=tr('请求较慢，等待响应 · 已保留上次数据');root.classList.remove('wt-refreshing');refreshButton.textContent=tr('等待响应');}},12000);
   return fs.exec('/usr/libexec/wan-traffic-api',[full?'status':'live']).then(function(r){
   if(disposed)return;
   if(r.code!==0)throw new Error(r.stderr||tr('读取失败'));var incoming=JSON.parse(r.stdout);
   if(full){latest=incoming;lastFull=Date.now();}else{
    latest.date=incoming.date;latest.time=incoming.time;latest.live=incoming.live;latest.rates=incoming.rates||[];
    if(incoming.today){var found=false;latest.days=latest.days.map(function(row){if(row.date===incoming.today.date){found=true;return incoming.today;}return row;});if(!found)latest.days.push(incoming.today);}
    (incoming.current_hour||[]).forEach(function(hour){var found=false;latest.hours=(latest.hours||[]).map(function(row){if(row.epoch===hour.epoch){found=true;return hour;}return row;});if(!found)latest.hours.push(hour);});
   }
   var live=latest.live, reset=Number(uci.get('wan_traffic','main','reset_day'))||1;
   var sums=core.summarize(latest.days,latest.date,reset);
   var active=live.timestamp && Math.abs(Date.now()/1000-live.timestamp)<30;
   status.textContent=live.blocked?tr('已阻止虚拟接口 · ')+live.device:(active?tr('● 正在统计 · '):tr('○ 等待接口 / 时间同步 · '))+(live.device||tr('未连接'));
   status.classList.toggle('wt-online',!!active);
   refreshMeta.textContent=tr('更新于 ')+latest.time+tr(' · 后台 5 秒采样')+(refreshSeconds?'':tr(' · 自动刷新已暂停'));
   var signature=[live.timestamp,live.blocked,active,latest.date,window.innerWidth,uci.get('wan_traffic','main','speed_unit'),reset,uci.get('wan_traffic','main','motion'),uci.get('wan_traffic','main','download_mbps'),uci.get('wan_traffic','main','upload_mbps')].join('|');
   if(!full && signature===lastRendered)return;
   lastRendered=signature;root.dataset.motion=uci.get('wan_traffic','main','motion')||'soft';
   replaceStable(cards,card(tr('今日流量'),sums.today,'Today',latest.date,core.series(latest.days,latest.date,7)),card(tr('近 7 天流量'),sums.week,'7 days',tr('包含今天 · ')+core.shift(latest.date,-6)+tr(' 起'),core.series(latest.days,latest.date,7)),card(tr('近 30 天流量'),sums.month,'30 days',tr('包含今天 · ')+core.shift(latest.date,-29)+tr(' 起'),core.series(latest.days,latest.date,30)),card(tr('累计总流量'),sums.total,'All time',tr('从安装并启动统计开始累计'),core.series(latest.days,latest.date,90)));
   var unit=uci.get('wan_traffic','main','speed_unit')||'bytes';
   replaceStable(details,E('div',{},[E('small',{},tr('↓ 实时下载')),E('strong',{},core.speed(active?live.rx_rate:0,unit))]),E('div',{},[E('small',{},tr('↑ 实时上传')),E('strong',{},core.speed(active?live.tx_rate:0,unit))]),E('div',{},[E('small',{},tr('本月账期 · ')+sums.start+tr(' 起')),E('strong',{},core.bytes(sums.cycle.rx+sums.cycle.tx))]),E('div',{},[E('small',{},tr('统计口径')),E('strong',{},tr('单网口 · ')+(live.device||tr('待连接')))]));
   if(full){paintChart();paintRecords();}paintInsights(sums,live,active,full);
  }).catch(function(err){if(!disposed){status.textContent=tr('读取失败：')+err.message+tr(' · 等待重试');status.classList.remove('wt-online');}}).finally(function(){busy=false;clearTimeout(pendingTimer);pendingTimer=null;if(!disposed){root.classList.remove('wt-refreshing');refreshButton.disabled=false;refreshButton.textContent=tr('立即刷新');}});
  }
  return m.render().then(function(formNode){
   root.appendChild(E('link',{rel:'stylesheet',href:L.resource('wan-traffic/dashboard.css')}));
   var exportButton=E('button',{type:'button','class':'wt-button',click:function(){if(!latest)return;var csv='Date,Download bytes,Upload bytes,Total bytes\n'+latest.days.map(function(r){return [r.date,r.rx,r.tx,r.rx+r.tx].join(',');}).join('\n');var url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));var link=E('a',{href:url,download:'wan-traffic-'+latest.date+'.csv'});link.click();setTimeout(function(){URL.revokeObjectURL(url);},1000);}},tr('导出 CSV'));
   root.appendChild(E('div',{'class':'wt-header'},[E('div',{},[E('small',{},'FLUXORA / WAN OBSERVATORY'),E('h2',{},tr('让每一份流量，都看得清楚。')),E('p',{'class':'wt-muted'},tr('趋势、节奏与预算 · 只看实际经过外网的流量'))]),E('div',{'class':'wt-header-actions'},[status,exportButton,toggle])]));
   root.dataset.motion=uci.get('wan_traffic','main','motion')||'soft';
   root.appendChild(E('div',{'class':'wt-toolbar'},[E('nav',{'class':'wt-jump','aria-label':tr('看板导航')},[[tr('总览'),cards],[tr('预算'),budget],[tr('实时速率'),real],[tr('行为画像'),hourly],[tr('历史记录'),records]].map(function(pair){return E('button',{type:'button',click:function(){pair[1].scrollIntoView({behavior:root.dataset.motion==='off' || window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}},pair[0]);})),E('div',{'class':'wt-refresh-controls'},[refreshMeta,refreshSelect,refreshButton])]));
   [tr('今日流量'),tr('近 7 天流量'),tr('近 30 天流量'),tr('总流量')].forEach(function(label){cards.appendChild(E('div',{'class':'wt-card'},[E('small',{},label),E('strong',{},tr('读取中…'))]));});
   root.appendChild(cards);root.appendChild(details);root.appendChild(insight);
   root.appendChild(E('div',{'class':'wt-grid-two'},[budget,mix]));
   root.appendChild(E('section',{'class':'wt-panel wt-daily'},[E('div',{'class':'wt-panel-head'},[E('div',{},[E('h3',{},tr('流量趋势')),subtitle]),rangeButtons]),chart]));
   root.appendChild(real);root.appendChild(E('div',{'class':'wt-grid-two'},[hourly,calendar]));
   root.appendChild(E('div',{'class':'wt-grid-two'},[ranking,health]));
   root.appendChild(E('section',{'class':'wt-panel'},records));
   root.appendChild(E('p',{'class':'wt-note'},tr('仅累计选定外网口的 RX / TX，包含 IPv4、IPv6 与路由器自身流量；不叠加 OpenClash / UA3F / TUN 统计。真实代理开销与重传仍计入。历史记录重启保留，突然断电最多丢失一个保存间隔。')));
   settings.appendChild(formNode);settings.hidden=true;root.appendChild(settings);
   document.addEventListener('visibilitychange',onVisibility);window.addEventListener('pagehide',onPageHide);window.addEventListener('pageshow',onPageShow);
   mountTimer=setTimeout(function(){if(!root.isConnected){dispose();return;}observer=new MutationObserver(function(){if(!root.isConnected)dispose();});observer.observe(document.body,{childList:true,subtree:true});startPolling();update(true);},0);
   return root;
  });
 }
});
