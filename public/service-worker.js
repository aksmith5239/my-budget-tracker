const APP_PREFIX = 'MyBudget-';     
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;


const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./js/index.js",
    "./css/styles.css",
    "/manifest.json",
    "./js/idb.js"
];


self.addEventListener('install', function(e) {
    e.waitUntil(
      caches.open(CACHE_NAME).then(function(cache) {
        console.log('installing cache : ' + CACHE_NAME)
        return cache.addAll(FILES_TO_CACHE)
      })
    )
  });

self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(keyList) {
            let cacheKeepList = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            })
            cacheKeepList.push(CACHE_NAME);

            return Promise.all(
                keyList.map(function(key, i) {
                    if(cacheKeepList.indexOf(key) === -1) {
                        cosole.log('deleting cache :' + keyList[i]);
                        return caches.delete(keyList[i]);
                    }
                })
            );
        })
    );
}); 

self.addEventListener('fetch', function(e) {
    console.log('fetch request : ' + e.request.url)
    e.respondWith(
        caches.match(e.request).then(function (request) {
            if (request) { //cache is available? then respond with the cache
                console.log('responding with the cache : ' + e.request.url)
                return request
            } else { // no cache? fetch request
                console.log('file is not cached, fetching : ' + e.request.url)
                return fetch(e.request)
            }
        })
    )
})
