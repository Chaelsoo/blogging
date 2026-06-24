'use strict';

;
window.addEventListener('load', () => {
    const gttButton = document.getElementById("totop");
    if (!gttButton) return;
    window.onscroll = () => {
        if (
            document.body.scrollTop > 300 ||
            document.documentElement.scrollTop > 300
        ) {
            gttButton.style.visibility = "visible";
            gttButton.style.opacity = "1";
        } else {
            gttButton.style.visibility = "hidden";
            gttButton.style.opacity = "0";
        }
    };
});

;
document.addEventListener('DOMContentLoaded', function() {
document.querySelectorAll('.highlight').forEach(function(block) {
  var code = block.querySelector('code');
  var lang = (code && code.getAttribute('data-lang')) || '';

  var wrapper = document.createElement('div');
  wrapper.className = 'code-block';

  var header = document.createElement('div');
  header.className = 'code-block-header';

  var dots = document.createElement('span');
  dots.className = 'code-block-dots';
  dots.innerHTML = '<span class="dot dot-red"></span><span class="dot dot-yellow"></span><span class="dot dot-green"></span>';

  var copyBtn = document.createElement('button');
  copyBtn.className = 'code-block-copy';
  copyBtn.textContent = 'copy';
  copyBtn.addEventListener('click', function() {
    var text = code ? code.innerText : '';
    navigator.clipboard.writeText(text).then(function() {
      copyBtn.textContent = 'copied!';
      copyBtn.classList.add('copied');
      setTimeout(function() {
        copyBtn.textContent = 'copy';
        copyBtn.classList.remove('copied');
      }, 2000);
    });
  });

  header.appendChild(dots);
  header.appendChild(copyBtn);
  wrapper.appendChild(header);

  block.parentNode.insertBefore(wrapper, block);
  wrapper.appendChild(block);
});
});
