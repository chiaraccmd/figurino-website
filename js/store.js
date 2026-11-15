/* Figurino — local storage in the browser (IndexedDB) */
(function (App) {
  'use strict';
  var DB_NAME = 'figurino', DB_VER = 1, STORES = ['items', 'outfits', 'shopping', 'meta'];
  var dbp = null;

  function open() {
    if (dbp) return dbp;
    dbp = new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, DB_VER);
      req.onupgradeneeded = function () {
        var db = req.result;
        STORES.forEach(function (s) { if (!db.objectStoreNames.contains(s)) db.createObjectStore(s, { keyPath: 'id' }); });
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
    return dbp;
  }
  function tx(store, mode, fn) {
    return open().then(function (db) {
      return new Promise(function (resolve, reject) {
        var t = db.transaction(store, mode), s = t.objectStore(store), out;
        out = fn(s);
        t.oncomplete = function () { resolve(out instanceof IDBRequest ? out.result : out); };
        t.onerror = function () { reject(t.error); };
        t.onabort = function () { reject(t.error); };
      });
    });
  }
  function all(store) { return tx(store, 'readonly', function (s) { return s.getAll(); }); }
  function get(store, id) { return tx(store, 'readonly', function (s) { return s.get(id); }); }
  function put(store, obj) { return tx(store, 'readwrite', function (s) { s.put(obj); }).then(function () { return obj; }); }
  function del(store, id) { return tx(store, 'readwrite', function (s) { s.delete(id); }); }
  function clear(store) { return tx(store, 'readwrite', function (s) { s.clear(); }); }
  function uid(prefix) { return (prefix || 'x') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7); }

  function blobToDataURL(b) { return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(r.result); }; r.onerror = rej; r.readAsDataURL(b); }); }
  function dataURLToBlob(u) {
    var m = /^data:([^;]+);base64,(.*)$/.exec(u || ''); if (!m) return null;
    var bin = atob(m[2]), arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: m[1] });
  }

  function exportAll() {
    return Promise.all(STORES.map(all)).then(function (res) {
      var data = { app: 'figurino', version: 1, exported: new Date().toISOString() };
      return Promise.all(res[0].map(function (c) {
        var copy = Object.assign({}, c);
        if (c.photo instanceof Blob) return blobToDataURL(c.photo).then(function (u) { copy.photo = u; return copy; });
        return copy;
      })).then(function (items) { data.items = items; data.outfits = res[1]; data.shopping = res[2]; data.meta = res[3]; return data; });
    });
  }
  function importAll(data, replace) {
    if (!data || data.app !== 'figurino') return Promise.reject(new Error('This file does not look like a Figurino backup.'));
    var p = replace ? Promise.all(STORES.map(clear)) : Promise.resolve();
    return p.then(function () {
      var jobs = [];
      (data.items || []).forEach(function (c) { if (c && c.id) { var copy = Object.assign({}, c); if (typeof c.photo === 'string') copy.photo = dataURLToBlob(c.photo); jobs.push(put('items', copy)); } });
      ['outfits', 'shopping', 'meta'].forEach(function (s) { (data[s] || []).forEach(function (o) { if (o && o.id) jobs.push(put(s, o)); }); });
      return Promise.all(jobs);
    });
  }
  function wipe() { return Promise.all(STORES.map(clear)); }

  App.store = { all: all, get: get, put: put, del: del, clear: clear, uid: uid, exportAll: exportAll, importAll: importAll, wipe: wipe, blobToDataURL: blobToDataURL };
})(window.App = window.App || {});
