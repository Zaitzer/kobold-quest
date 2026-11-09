/* Website only (SITE build): log in or make an account on the title screen, then play on the shared server. */
import {createOnline} from '../adapters/online.js';
import {platform} from '../adapters/platform.js';
import {store} from '../adapters/storage.js';
import {view} from '../core/app.js';
import {feature} from '../core/registry.js';
import {rpSave} from '../core/save.js';
import {rp} from '../core/state.js';
import {$} from '../engine/util.js';
import {rpToast} from '../game/dialogue.js';
import {net, netInit} from '../net/core.js';

let online = null;
function setupKofi() {
  const btn = document.createElement('a');
  btn.href = 'https://ko-fi.com/YOUR_KOFI';
  btn.target = '_blank';
  btn.rel = 'noopener noreferrer';
  btn.id = 'kofi-btn';
  btn.className = 'linkbtn';
  btn.textContent = '☕ Keep the kobolds warm';
  $('go-rpg').insertAdjacentElement('afterend', btn);
  const hint = document.createElement('p');
  hint.id = 'kofi-hint';
  hint.textContent = 'Type your in-game username in the Ko-fi note to link your ⭐ Supporter badge.';
  btn.insertAdjacentElement('afterend', hint);
  fetch('/api/supporters')
    .then(r => (r.ok ? r.json() : null))
    .then(d => {
      const list = document.createElement('p');
      list.id = 'supporters-list';
      if (!d || !d.supporters.length) {
        list.textContent = 'No supporters yet — be the first ember.';
      } else {
        list.textContent = '⭐ ' + d.supporters.join(' · ');
      }
      hint.insertAdjacentElement('afterend', list);
    })
    .catch(() => {});
  const badge = document.createElement('span');
  badge.id = 'supporter-badge';
  badge.hidden = true;
  badge.textContent = ' ⭐ Supporter';
  $('tuser').appendChild(badge);
}
async function checkSupporter() {
  const token = store.get('kq-token', null);
  if (!token) return;
  try {
    const r = await fetch('/api/is-supporter?token=' + encodeURIComponent(token));
    if (r.ok) {
      const d = await r.json();
      const badge = document.getElementById('supporter-badge');
      if (badge) badge.hidden = !d.supporter;
    }
  } catch (e) {}
}
/* a newer version is live: save and reload, but never in the middle of a fight or a lobby */
function updateWhenSafe() {
  if (rp.s && (rp.mode === 'battle' || rp.mode === 'lobby')) {
    setTimeout(updateWhenSafe, 3000);
    return;
  }
  try {
    if (rp.s && view === 'rpg') rpSave();
  } catch (e) {}
  if (rp.s && view === 'rpg') rpToast('Updating to the newest version…');
  setTimeout(() => location.reload(), view === 'rpg' ? 900 : 100);
}
function wsUrl() {
  return (location.protocol === 'https:' ? 'wss:' : 'ws:') + '//' + location.host + '/ws';
}
function say(t, bad) {
  const m = $('login-msg');
  m.textContent = t || '';
  m.classList.toggle('bad', !!bad);
}
function showLoggedOut() {
  $('login').hidden = false;
  $('go-rpg').hidden = true;
  $('tuser').hidden = true;
  setTimeout(() => {
    try {
      $('login-name').focus();
    } catch (e) {}
  }, 50);
}
async function loggedIn(me) {
  platform.provider = online.provider;
  say('Loading your kobolds…');
  await netInit();
  say('');
  $('login').hidden = true;
  $('tuser-name').textContent = me.name;
  $('tuser').hidden = false;
  $('go-rpg').hidden = false;
  $('login-pass').value = '';
  if (!document.getElementById('kofi-btn')) setupKofi();
  checkSupporter();
}
async function attempt(kind) {
  const name = $('login-name').value.trim(),
    pass = $('login-pass').value;
  if (!name || !pass) {
    say('Type a name and a password.', true);
    return;
  }
  $('login-go').disabled = $('login-new').disabled = true;
  say(kind === 'register' ? 'Making your account…' : 'Logging in…');
  const code = $('login-code').value.trim();
  try {
    if (code && kind === 'login') {
      say('Setting your new password…');
      await online.account.resetpw(name, code, pass);
      $('login-code').value = '';
      $('login-code').hidden = true;
    }
    await loggedIn(await online.account[kind](name, pass));
  } catch (e) {
    say(typeof e === 'string' ? e : "Can't reach the game server.", true);
  }
  $('login-go').disabled = $('login-new').disabled = false;
}
feature({
  id: 'site-login',
  init() {
    if (typeof SITE === 'undefined' || !SITE) return;
    online = net.online = createOnline(wsUrl());
    online.account.onNewVersion = updateWhenSafe;
    $('login').addEventListener('submit', e => {
      e.preventDefault();
      attempt('login');
    });
    $('login-new').addEventListener('click', () => attempt('register'));
    $('login-hascode').addEventListener('click', () => {
      const c = $('login-code');
      c.hidden = false;
      c.focus();
      say('Type your name, the code, and the new password you want.');
    });
    $('logout').addEventListener('click', () => {
      online.account.logout();
      location.reload();
    });
    $('go-rpg').hidden = true;
    if (online.account.hasToken()) {
      say('Logging in…');
      $('login').hidden = false;
      online.account
        .resume()
        .then(loggedIn)
        .catch(e => {
          say(typeof e === 'string' ? e : '', !!e);
          showLoggedOut();
        });
    } else showLoggedOut();
  }
});
export {attempt, checkSupporter, loggedIn, online, say, setupKofi, showLoggedOut, updateWhenSafe, wsUrl};
