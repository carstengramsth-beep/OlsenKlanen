/* ================================================================
   moederum-cobrowse.js  —  LIVE-SPEJLING (co-browsing) af olsenklanen.dk
   Lederen optager sin iframe med rrweb og streamer den via Firebase;
   følgere afspiller den i realtid (dør der åbner, billeder, bladring,
   musepil, redigering osv.) — uden skærmdeling.
   Kanal: vmr_rum/__rr/{rum}  (events) + vmr_rum/__delt/{rum}/rrGen
   Læser window.__foelg.erFoerer og window.aktivtRum fra hoved-modulet.
   2026-07-14
   ================================================================ */
import { getApps } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, set, remove, onChildAdded }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const RRWEB_URL = 'https://cdn.jsdelivr.net/npm/rrweb@2.0.0-alpha.11/dist/rrweb.min.js';

let db = null;

// ---- state (leder) ----
let leaderRecording = false;
let leaderStop = null;
let leaderDoc = null;
let leaderCount = 0;

// ---- state (følger) ----
let follower = false;
let replayer = null;
let streamUnsub = null;
let seenGen = null;
let evCount = 0;

let replayBox = null;
let rrDbg = null;

function erFoerer(){ return !!(window.__foelg && window.__foelg.erFoerer); }
function rum(){ return window.aktivtRum || null; }
function splitOpen(){ const ov = document.getElementById('video-overlay'); return !!(ov && ov.classList.contains('split')); }
function harFoerer(){ return !!(window.__foelg && window.__foelg.sisteD && window.__foelg.sisteD.foererNr); }
function dbg(t){ if(rrDbg) rrDbg.textContent = t; }

function loadRrwebParent(){
  return new Promise(function(res){
    if(window.rrweb) return res(true);
    const s = document.createElement('script'); s.src = RRWEB_URL;
    s.onload = function(){ res(true); }; s.onerror = function(){ res(false); };
    document.head.appendChild(s);
  });
}

function init(){
  try {
    if(!getApps || getApps().length === 0){ return setTimeout(init, 300); }
    db = getDatabase();
  } catch(e){ return setTimeout(init, 300); }
  start();
}

function start(){
  loadRrwebParent();
  buildUI();
  setInterval(tick, 500);
}

function buildUI(){
  const voBody = document.getElementById('vo-body');
  const jb = document.getElementById('jitsi-boks');
  if(voBody && !document.getElementById('rr-replay')){
    replayBox = document.createElement('div'); replayBox.id = 'rr-replay';
    replayBox.style.cssText = 'flex:0 0 64%;background:#fff;overflow:auto;display:none;height:100%;position:relative;';
    if(jb) voBody.insertBefore(replayBox, jb); else voBody.appendChild(replayBox);
  } else {
    replayBox = document.getElementById('rr-replay');
  }
  const topbar = document.getElementById('vo-topbar');
  if(topbar && !document.getElementById('rr-debug')){
    rrDbg = document.createElement('span'); rrDbg.id = 'rr-debug';
    rrDbg.style.cssText = 'color:#7fd07f;font-size:11px;font-family:monospace;margin-left:8px;white-space:nowrap;';
    topbar.appendChild(rrDbg);
  } else {
    rrDbg = document.getElementById('rr-debug');
  }
}

function tick(){
  const r = rum();
  const active = r && splitOpen();
  if(active && erFoerer()){
    teardownFollower();
    ensureLeader(r);
  } else if(active && !erFoerer() && harFoerer()){
    teardownLeader();
    ensureFollower(r);
  } else {
    teardownLeader();
    teardownFollower();
    dbg('rr:-');
  }
}

/* ===================== LEDER ===================== */
function ensureLeader(r){
  if(!window.rrweb){ dbg('rr:lib…'); return; }
  const ifr = document.getElementById('site-frame'); if(!ifr) return;
  let iwin = null, idoc = null;
  try { iwin = ifr.contentWindow; idoc = ifr.contentDocument; } catch(e){ return; }
  if(!iwin || !idoc || !idoc.body) return;
  try { if(idoc.location && idoc.location.href === 'about:blank') return; } catch(e){}
  if(leaderRecording && leaderDoc === idoc){ return; }
  if(leaderRecording && leaderDoc !== idoc){ teardownLeader(); }
  if(!iwin.rrweb){
    if(!idoc.getElementById('__rrlib')){
      const s = idoc.createElement('script'); s.id = '__rrlib'; s.src = RRWEB_URL;
      idoc.head.appendChild(s);
    }
    dbg('rr:load…'); return;
  }
  beginLeaderRecord(iwin, idoc, r);
}

function beginLeaderRecord(iwin, idoc, r){
  if(leaderRecording) return;
  leaderRecording = true; leaderDoc = idoc; leaderCount = 0;
  const gen = Date.now();
  const rrRef = ref(db, 'vmr_rum/__rr/' + r);
  remove(rrRef).then(function(){
    try { set(ref(db, 'vmr_rum/__delt/' + r + '/rrGen'), gen); } catch(e){}
    try {
      leaderStop = iwin.rrweb.record({
        emit: function(ev){
          leaderCount++;
          try { push(rrRef, ev); } catch(e){}
          if(leaderCount % 15 === 0) dbg('rr:SENDER ' + leaderCount);
        },
        sampling: { mousemove: 40, scroll: 100, media: 500, input: 'last' }
      });
      dbg('rr:SENDER');
    } catch(e){ leaderRecording = false; dbg('rr:fejl'); }
  }).catch(function(){ leaderRecording = false; });
}

function teardownLeader(){
  if(leaderStop){ try { leaderStop(); } catch(e){} leaderStop = null; }
  leaderRecording = false; leaderDoc = null;
}

/* ===================== FØLGER ===================== */
function ensureFollower(r){
  const gen = (window.__foelg && window.__foelg.sisteD && window.__foelg.sisteD.rrGen) || 0;
  if(!follower){ startFollower(r, gen); return; }
  if(gen !== seenGen){ resetFollower(r, gen); }
}

function startFollower(r, gen){
  follower = true; seenGen = gen; evCount = 0;
  showReplay(true);
  attachStream(r);
  dbg('rr:MODTAGER');
}

function resetFollower(r, gen){
  detachStream();
  if(replayer){ try { replayer.destroy(); } catch(e){} replayer = null; }
  if(replayBox) replayBox.innerHTML = '';
  seenGen = gen; evCount = 0;
  attachStream(r);
}

function attachStream(r){
  detachStream();
  const rrRef = ref(db, 'vmr_rum/__rr/' + r);
  streamUnsub = onChildAdded(rrRef, function(snap){
    const e = snap.val(); if(e) feed(e);
  });
}

function detachStream(){
  if(streamUnsub){ try { streamUnsub(); } catch(e){} streamUnsub = null; }
}

function feed(e){
  evCount++;
  try {
    if(!window.rrweb || !window.rrweb.Replayer){ return; }
    if(!replayer){
      replayer = new window.rrweb.Replayer([e], { liveMode: true, root: replayBox, mouseTail: false });
      try { replayer.startLive(e.timestamp); } catch(err){}
    } else {
      replayer.addEvent(e);
    }
    if(e.type === 4 && e.data){ scaleReplay(e.data.width, e.data.height); }
  } catch(err){}
  if(evCount % 15 === 0) dbg('rr:MODTAGER ' + evCount);
}

function scaleReplay(w, h){
  if(!replayer || !replayer.wrapper || !replayBox) return;
  const bw = replayBox.clientWidth || 1;
  const s = w ? (bw / w) : 1;
  try {
    replayer.wrapper.style.transformOrigin = 'top left';
    replayer.wrapper.style.transform = 'scale(' + s + ')';
  } catch(e){}
}

function teardownFollower(){
  if(!follower && !replayer){ return; }
  detachStream();
  if(replayer){ try { replayer.destroy(); } catch(e){} replayer = null; }
  if(replayBox) replayBox.innerHTML = '';
  follower = false; seenGen = null; evCount = 0;
  showReplay(false);
}

function showReplay(on){
  const ifr = document.getElementById('site-frame');
  if(replayBox) replayBox.style.display = on ? 'block' : 'none';
  if(ifr) ifr.style.display = on ? 'none' : '';
}

init();
