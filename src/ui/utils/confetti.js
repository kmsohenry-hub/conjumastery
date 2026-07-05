export function launchConfetti() {
  const colors = ['#6C5CE7', '#00CEC9', '#FD79A8', '#FDCB6E', '#00B894', '#E17055'];
  for (let i = 0; i < 30; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.top = 80 + Math.random() * 20 + 'vh';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    piece.style.width = 6 + Math.random() * 8 + 'px';
    piece.style.height = 6 + Math.random() * 8 + 'px';
    piece.style.animationDuration = 0.8 + Math.random() * 1.2 + 's';
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 2500);
  }
}
