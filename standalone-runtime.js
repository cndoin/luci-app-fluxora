// Bundled with the same core, translations and dashboard used by LuCI.
'use strict';
function E(tag,attrs,children){var el=document.createElement(tag);Object.keys(attrs||{}).forEach(function(k){if(typeof attrs[k]==='function')el.addEventListener(k,attrs[k]);else el.setAttribute(k,attrs[k]);});function add(c){if(c==null)return;if(Array.isArray(c))c.forEach(add);else el.appendChild(c instanceof Node?c:document.createTextNode(String(c)));}add(children);return el;}
var config={},baseclass={extend:function(x){return x;}},view=baseclass;
var uci={load:function(){return Promise.resolve();},get:function(a,b,key){return config[key];}};
var L={standalone:true,resource:function(){return '/dashboard.css';}};
var timers=new Map(),poll={add:function(fn,seconds){poll.remove(fn);timers.set(fn,setInterval(fn,seconds*1000));},remove:function(fn){clearInterval(timers.get(fn));timers.delete(fn);}};
function read(operation){return fetch('/cgi-bin/data?'+operation,{cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(12000)}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.text();});}
var fs={exec:function(path,args){if(path!=='/usr/libexec/wan-traffic-api' || !['live','status'].includes(args[0]))return Promise.reject(new Error('Unsupported operation'));return read(args[0]).then(function(text){return {code:0,stdout:text};});}};
var form={NamedSection:function(){},Value:0,ListValue:1,Flag:2,Map:function(){this.section=function(){return {option:function(){return {value:function(){},depends:function(){}};}};};this.render=function(){return Promise.resolve(E('div'));};}};
function startStandalone(app){
 var languageControl=document.getElementById('language');languageControl.value=localStorage.getItem('fluxora-language')||'auto';
 languageControl.onchange=function(){localStorage.setItem('fluxora-language',this.value);location.reload();};
 var theme=localStorage.getItem('fluxora-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=theme;
 document.getElementById('theme').onclick=function(){var dark=document.documentElement.dataset.theme==='dark'||(!document.documentElement.dataset.theme&&matchMedia('(prefers-color-scheme: dark)').matches);theme=dark?'light':'dark';document.documentElement.dataset.theme=theme;localStorage.setItem('fluxora-theme',theme);};
 document.getElementById('fullscreen').onclick=function(){if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen().catch(function(){});};
 read('config').then(function(text){config=JSON.parse(text);var preference=languageControl.value;if(preference!=='auto')config.language=preference;return app.load();}).then(function(data){return app.render(data);}).then(function(root){root.classList.add('wt-standalone');document.getElementById('app').replaceChildren(root);document.documentElement.lang=i18n.language(config.language,null,navigator.language);}).catch(function(error){document.getElementById('loading').textContent='Fluxora · '+error.message;});
}
