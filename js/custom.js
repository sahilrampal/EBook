
  (function ($) {
  
  "use strict";

    // MENU
    $('.navbar-collapse a').on('click',function(){
      $(".navbar-collapse").collapse('hide');
    });
    
    // CUSTOM LINK
    $('.smoothscroll').click(function(){
      var el = $(this).attr('href');
      var elWrapped = $(el);
      var header_height = $('.navbar').height();
  
      scrollToDiv(elWrapped,header_height);
      return false;
  
      function scrollToDiv(element,navheight){
        var offset = element.offset();
        var offsetTop = offset.top;
        var totalScroll = offsetTop-navheight;
  
        $('body,html').animate({
        scrollTop: totalScroll
        }, 300);
      }
    });
  
  })(window.jQuery);


// Register service worker and handle updates
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
      navigator.serviceWorker.register('/EBOOK/sw.js')
          .then(registration => {
              console.log('ServiceWorker registration successful');
              
              // Check for updates every hour
              setInterval(() => {
                  registration.update();
              }, 60 * 60 * 1000);
              
              // Listen for controller change (when new SW takes over)
              navigator.serviceWorker.addEventListener('controllerchange', () => {
                  window.location.reload();
              });
              
              // If there's a waiting service worker, prompt user to update
              if (registration.waiting) {
                  showUpdateNotification();
              }
              
              // Track installing worker to prompt when installed
              registration.addEventListener('updatefound', () => {
                  const newWorker = registration.installing;
                  newWorker.addEventListener('statechange', () => {
                      if (newWorker.state === 'installed' && registration.waiting) {
                          showUpdateNotification();
                      }
                  });
              });
          })
          .catch(err => {
              console.log('ServiceWorker registration failed: ', err);
          });
  });
}

function showUpdateNotification() {
  // Customize this to match your UI
  if (confirm('A new version is available. Update now?')) {
      // Tell the service worker to skip waiting and activate
      navigator.serviceWorker.controller.postMessage({action: 'skipWaiting'});
  }
}