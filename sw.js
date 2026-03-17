self.addEventListener('install', (e) => {
    console.log('[Manhaaji PWA] Install');
});
self.addEventListener('fetch', (e) => {
    // يترك فارغاً للعمل أونلاين فقط، ويفعل طلب التثبيت (Install Prompt).
});
