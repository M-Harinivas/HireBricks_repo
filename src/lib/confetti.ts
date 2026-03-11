// Simple confetti effect
export default function confetti() {
  const colors = ['#2563EB', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];
  for (let i = 0; i < 50; i++) {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;top:-10px;left:${Math.random()*100}vw;width:8px;height:8px;background:${colors[Math.floor(Math.random()*colors.length)]};border-radius:50%;z-index:9999;pointer-events:none;`;
    document.body.appendChild(el);
    const anim = el.animate([
      { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
      { transform: `translateY(${window.innerHeight + 20}px) rotate(${Math.random()*720}deg)`, opacity: 0 }
    ], { duration: 1500 + Math.random() * 1000, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' });
    anim.onfinish = () => el.remove();
  }
}
