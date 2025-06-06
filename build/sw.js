/**
 * Service Worker para o PWA LaGRÉCIA Pizzaria
 * Versão: 1.0
 * * Este Service Worker usa uma estratégia "Stale-While-Revalidate".
 * - Tenta servir os recursos do cache primeiro para um carregamento rápido.
 * - Em paralelo, busca uma nova versão da rede e atualiza o cache para a próxima visita.
 * - Isso garante que o utilizador tenha sempre a versão mais recente sem sacrificar a velocidade.
 */

const CACHE_NAME = 'lagrecia-pwa-cache-v1';

// O Service Worker é instalado
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Instalado');
  // Força a ativação do novo Service Worker imediatamente
  event.waitUntil(self.skipWaiting());
});

// O Service Worker é ativado e limpa caches antigos
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Ativado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] A limpar cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Torna este SW o controlador para todas as abas
  );
});

// Intercepta os pedidos de rede
self.addEventListener('fetch', event => {
  // Ignora pedidos que não sejam GET (ex: POST para webhooks, etc.)
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignora pedidos para extensões do Chrome
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Para pedidos de navegação (ex: o próprio HTML) e recursos principais
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        // Tenta buscar da rede em segundo plano
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // Se o pedido à rede for bem-sucedido, atualiza o cache
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });

        // Retorna a resposta do cache imediatamente se existir, senão, aguarda a resposta da rede
        return cachedResponse || fetchPromise;
      });
    })
  );
});