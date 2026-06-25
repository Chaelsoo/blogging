document.addEventListener('DOMContentLoaded', function () {
  var overlay = document.createElement('div');
  overlay.id = 'lb-overlay';
  var img = document.createElement('img');
  img.id = 'lb-img';
  overlay.appendChild(img);
  document.body.appendChild(overlay);

  document.querySelectorAll('.page-content img').forEach(function (el) {
    el.style.cursor = 'zoom-in';
    el.addEventListener('click', function () {
      img.src = el.src;
      img.alt = el.alt;
      overlay.classList.add('active');
    });
  });

  overlay.addEventListener('click', function () {
    overlay.classList.remove('active');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') overlay.classList.remove('active');
  });
});
