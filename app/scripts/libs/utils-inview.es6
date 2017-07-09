/*globals */
define(['util'], function (U) {
  const opts = {
    root: null, // viewport
    rootMargin: '0px',
    threshold: 0.01,
  };

  function logger(entries, observer) {
    entries.forEach(entry => {
      window.console.log('utils-inview', entry, observer);
    });
  }

  function watchFor(sel) {
    let observer = new IntersectionObserver(logger, opts);
    let target = document.querySelector(sel);

    if (target) observer.observe(target);
  }

  return U.expando(U, {
    watchFor,
  });
});
