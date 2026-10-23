/* ---------- gifts: gold, a potion or ether, a material or a piece from the backpack, to a friend online (game/items.js "trade") ---------- */
import {rpBuzz} from '../core/options.js';
import {feature} from '../core/registry.js';
import {rpSave} from '../core/save.js';
import {rp} from '../core/state.js';
import {sfx} from '../engine/audio.js';
import {button} from '../engine/html.js';
import {clamp, esc2} from '../engine/util.js';
import {rpToast} from '../game/dialogue.js';
import {tradeLabel, tradeList, tradePut, tradeTake, tradeValid} from '../game/items.js';
import {net, netEmit, netName, netNameOf, netOnline, netRid} from './core.js';

function netGive(kind, val) {
  if (!netOnline() || !net.partner) return;
  const s = rp.s;
  let label = '';
  if (s.test) {
    rpToast("A test hero can't give gifts.");
    return;
  }
  if (kind === 'gold') {
    val = Math.min(+val, Math.floor(s.gold));
    if (val <= 0) return;
    s.gold -= val;
    label = val + ' gold';
  } else {
    if (!tradeValid(kind, val) || !tradeTake(kind, val)) return;
    label = tradeLabel(kind, val);
  }
  const gid = netRid();
  net.gifts[gid] = {kind, val, label, t: performance.now(), last: performance.now(), to: net.partner.peer};
  netEmit({t: 'gift', gid, to: net.partner.peer, kind, val});
  rpToast('Sent ' + label + ' to ' + netName() + '.');
  rpSave();
}
function netGotGift(d, msg) {
  if (!rp.s) return;
  const ack = () => netEmit({t: 'gack', gid: d.gid, to: msg.peer});
  if (net.giftsIn.has(d.gid)) {
    ack();
    return;
  }
  const s = rp.s;
  let label = '';
  if (d.kind === 'gold') {
    const v = clamp(+d.val | 0, 0, 100000);
    s.gold += v;
    label = v + ' gold';
  } else if (tradeValid(d.kind, d.val)) {
    tradePut(d.kind, d.val);
    label = tradeLabel(d.kind, d.val);
  } else return;
  net.giftsIn.add(d.gid);
  ack();
  rpSave();
  rpToast(netName() + ' gave you ' + label + '!');
  if (!rp.headless) sfx('win');
  rpBuzz(30);
}
function netGiftTick() {
  const now = performance.now();
  for (const gid in net.gifts) {
    const G = net.gifts[gid];
    if (now - G.t > 30000) {
      delete net.gifts[gid];
      /* never arrived: give it back */ if (G.kind === 'gold') rp.s.gold += G.val;
      else tradePut(G.kind, G.val);
      rpToast(G.label + " couldn't be delivered, so you kept it.");
      rpSave();
      continue;
    }
    if (now - G.last > 2000) {
      G.last = now;
      netEmit({t: 'gift', gid, to: G.to, kind: G.kind, val: G.val});
    }
  }
}
const giftRows = [];
function netTradeHtml() {
  const s = rp.s;
  giftRows.length = 0;
  let h =
    '<div class="rpdlg"><div class="who">Give to ' +
    esc2(netName()) +
    '</div><p>Tap to send. It arrives in their backpack right away.</p></div><div class="rpcmd shop">';
  h += [10, 50]
    .map(v =>
      button('net:give', v + ' gold', {
        cls: 'go',
        v: v,
        data: {k: 'gold'},
        disabled: s.gold < v,
        sub: 'You have ' + Math.floor(s.gold),
        raw: 1
      })
    )
    .join('');
  h += tradeList()
    .map(([k, v, label]) => {
      giftRows.push([k, v]);
      return button('net:give', esc2(label), {cls: k === 'item' ? '' : 'it', v: giftRows.length - 1, data: {k: 'list'}, raw: 1});
    })
    .join('');
  return h + button('net:tradeclose', 'Done', {cls: 'x'}) + '</div>';
}

feature({
  id: 'trade',
  panels: {trade: {sig: () => rp.s.gold + JSON.stringify([rp.s.mats6, rp.s.bag, (rp.s.inv6 || []).length]), html: () => netTradeHtml()}}
});
feature({
  id: 'net-gift-io',
  net: {
    gift(d, msg) {
      netGotGift(d, msg);
    },
    gack(d, msg) {
      if (net.gifts[d.gid]) {
        const G = net.gifts[d.gid];
        delete net.gifts[d.gid];
        rpToast(netNameOf(G.to) + ' got ' + G.label + '.');
      }
    }
  },
  actions: {
    'net:trade'(d) {
      rp.mode = 'trade';
    },
    'net:tradeclose'(d) {
      rp.mode = 'map';
    },
    'net:give'(d) {
      if (d.k === 'gold') netGive('gold', +d.v);
      else {
        const P = giftRows[+d.v];
        if (P) netGive(P[0], P[1]);
      }
    }
  }
});
export {giftRows, netGiftTick, netGive, netGotGift, netTradeHtml};
