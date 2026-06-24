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
