/* Browser storage behind one door. It can be missing or throw (private windows, blocked storage, previews),
   so every call is guarded and the game keeps going without it. Tests swap `store.backend`. */
const store = {
  backend: null,
  raw() {
    if (this.backend) return this.backend;
    try {
      return window.localStorage || null;
    } catch (e) {
      return null;
    }
  },
  get(key, fallback) {
    try {
      const v = this.raw().getItem(key);
      return v == null ? fallback : JSON.parse(v);
    } catch (e) {
      return fallback;
    }
  },
  set(key, val) {
    try {
      this.raw().setItem(key, JSON.stringify(val));
      return true;
    } catch (e) {
      return false;
    }
  }
};
export {store};
