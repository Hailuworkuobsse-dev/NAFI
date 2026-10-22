if (!self.define) {
  let e,
    s = {};
  const i = (i, n) => (
    (i = new URL(i + ".js", n).href),
    s[i] ||
      new Promise((s) => {
        if ("document" in self) {
          const e = document.createElement("script");
          ((e.src = i), (e.onload = s), document.head.appendChild(e));
        } else ((e = i), importScripts(i), s());
      }).then(() => {
        let e = s[i];
        if (!e) throw new Error(`Module ${i} didn’t register its module`);
        return e;
      })
  );
  self.define = (n, r) => {
    const c =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (s[c]) return;
    let o = {};
    const l = (e) => i(e, c),
      a = { module: { uri: c }, exports: o, require: l };
    s[c] = Promise.all(n.map((e) => a[e] || l(e))).then((e) => (r(...e), o));
  };
}
define(["./workbox-8553a241"], function (e) {
  "use strict";
  (importScripts("/sw-extra.js"),
    self.addEventListener("message", (e) => {
      e.data && "SKIP_WAITING" === e.data.type && self.skipWaiting();
    }),
    e.precacheAndRoute(
      [
        { url: "sw-extra.js", revision: "acc3e022673304bd51bcb9c77f077908" },
        { url: "registerSW.js", revision: "1872c500de691dce40960bb85481de07" },
        { url: "index.html", revision: "428704b93132b7f74e18b6cf198a64f0" },
        { url: "favicon.svg", revision: "40b7ce4d8838413b3497c261fdf99b80" },
        {
          url: "pwa/offline.html",
          revision: "e7fd47f2a74ab52a4448607c730bd204",
        },
        {
          url: "pwa/icon-512.png",
          revision: "29b632c7579f7c56bc87d7bbe2247e17",
        },
        {
          url: "pwa/icon-512-maskable.png",
          revision: "d595a940a9263415c9d9fc4b9b95c9d7",
        },
        {
          url: "pwa/icon-192.png",
          revision: "5d3d088b29656c6a9554c95c9b81bf3f",
        },
        { url: "assets/react-DO05i5vs.js", revision: null },
        { url: "assets/query-BGQ-OtBH.js", revision: null },
        { url: "assets/index-DCXpYVCn.css", revision: null },
        { url: "assets/index-BSfcsDSP.js", revision: null },
        { url: "assets/icons-BMBvgAnn.js", revision: null },
        { url: "assets/i18n-DxPa9wcu.js", revision: null },
        { url: "assets/form-_fyWe8RY.js", revision: null },
        {
          url: "pwa/icon-192.png",
          revision: "5d3d088b29656c6a9554c95c9b81bf3f",
        },
        {
          url: "pwa/icon-512-maskable.png",
          revision: "d595a940a9263415c9d9fc4b9b95c9d7",
        },
        {
          url: "pwa/icon-512.png",
          revision: "29b632c7579f7c56bc87d7bbe2247e17",
        },
        {
          url: "manifest.webmanifest",
          revision: "053f097274d7edc8d76cca05d6f7ab26",
        },
      ],
      {},
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      new e.NavigationRoute(e.createHandlerBoundToURL("/index.html"), {
        denylist: [/^\/api\//, /^\/auth\//],
      }),
    ),
    e.registerRoute(
      ({ url: e, request: s }) =>
        "GET" === s.method && e.pathname.startsWith("/api/"),
      new e.NetworkFirst({
        cacheName: "nafi-api",
        networkTimeoutSeconds: 5,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 86400 }),
          new e.CacheableResponsePlugin({ statuses: [0, 200] }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:js|css|woff2|png|svg|ico)$/,
      new e.CacheFirst({
        cacheName: "nafi-static",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 2592e3 }),
        ],
      }),
      "GET",
    ));
});
