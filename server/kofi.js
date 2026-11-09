/* Ko-fi donation integration: webhook handler and supporter check.
   Players type their game username in the Ko-fi message/note field when donating.
   The webhook stores them; /api/is-supporter checks their session token. */
const crypto = require('crypto');
const sha = t => crypto.createHash('sha256').update(String(t)).digest('hex');

class Kofi {
  constructor(store, config) {
    this.store = store;
    this.token = config.kofiToken || null;
  }

  /* Handle incoming Ko-fi webhook (POST /api/kofi-webhook).
     Ko-fi sends: Content-Type: application/x-www-form-urlencoded, body: data=<URL-encoded JSON> */
  async webhook(rawBody) {
    let d;
    try {
      const params = new URLSearchParams(rawBody);
      const raw = params.get('data');
      d = JSON.parse(raw != null ? raw : rawBody);
    } catch (e) {
      return {ok: false, err: 'bad payload'};
    }
    if (this.token && d.verification_token !== this.token) return {ok: false, err: 'bad token'};
    const id = d.kofi_transaction_id || d.message_id;
    if (!id) return {ok: false, err: 'no id'};
    await this.store.put('kofi/tx/' + id, d);
    /* Players include their game username as the first word of their Ko-fi message. */
    const msg = (d.message || '').trim();
    if (msg) {
      const word = msg.split(/\s+/)[0].toLowerCase();
      const u = await this.store.get('users/' + word);
      if (u) {
        await this.store.put('kofi/player/' + u.lname, {active: true, email: d.email || null, since: Date.now()});
        return {ok: true, linked: u.lname};
      }
    }
    /* Store unlinked donations by email for admin to link manually. */
    if (d.email) await this.store.put('kofi/unlinked/' + d.email.toLowerCase(), {since: Date.now(), tx: id, msg});
    return {ok: true};
  }

  /* Check if the player associated with a session token is a Ko-fi supporter. */
  async isSupporter(token) {
    if (!token) return false;
    const session = await this.store.get('sessions/' + sha(token));
    if (!session || session.until < Date.now()) return false;
    const s = await this.store.get('kofi/player/' + session.lname);
    return !!(s && s.active);
  }

  /* Return sorted list of active supporter usernames (public). */
  async listSupporters() {
    const rows = await this.store.list('kofi/player/');
    return rows.filter(r => r.val && r.val.active).map(r => r.key.slice('kofi/player/'.length)).sort();
  }
}

module.exports = {Kofi};
