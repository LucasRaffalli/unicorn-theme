/* Unicorn Sparkles : traînée de paillettes derrière le pointeur (équivalent du plugin JetBrains).
 * Chargé par workbench.html. Désactiver sans désinstaller :
 *   localStorage.setItem('unicorn-sparkles', 'off')   (console des outils de développement)
 */
(function () {
  'use strict';

  var SPAWN_DISTANCE = 22;
  var MAX_SPARKLES = 34;
  var GRAVITY = 0.045;
  var MIN_SIZE = 3.5, MAX_SIZE = 7;
  var MIN_LIFE = 40, MAX_LIFE = 80;
  var DARK = ['#f480c1', '#e0559f', '#bd93f9', '#ff9fd6', '#c77dff'];
  var LIGHT = ['#e0559f', '#b83a7e', '#8458ee', '#cf4a95', '#9a62e0'];
  var FRAME_MS = 1000 / 60;

  try {
    if (localStorage.getItem('unicorn-sparkles') === 'off') { return; }
  } catch (e) { /* stockage indisponible : on continue */ }

  function rand(min, max) { return min + Math.random() * (max - min); }

  function start() {
    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;' +
      'pointer-events:none;z-index:2147483647;';
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;

    function resize() {
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
    }
    resize();
    window.addEventListener('resize', resize);

    var sparkles = [];
    var running = false;
    var lastTime = 0;
    var lastX = null, lastY = null, travelled = 0;

    function palette() {
      return document.body.classList.contains('vs') ? LIGHT : DARK;
    }

    function spawn(x, y) {
      if (sparkles.length >= MAX_SPARKLES) { sparkles.shift(); }
      var colors = palette();
      var life = Math.round(rand(MIN_LIFE, MAX_LIFE));
      sparkles.push({
        x: x, y: y,
        vx: rand(-0.6, 0.6), vy: rand(-0.8, 0.2),
        spin: rand(-0.06, 0.06), rot: rand(0, Math.PI),
        size: rand(MIN_SIZE, MAX_SIZE),
        color: colors[Math.floor(Math.random() * colors.length)],
        life: life, maxLife: life
      });
      if (!running) {
        running = true;
        lastTime = performance.now();
        requestAnimationFrame(frame);
      }
    }

    // Étoile à quatre branches aux courbes douces
    function star(c) {
      ctx.beginPath();
      ctx.moveTo(0, -1);
      ctx.quadraticCurveTo(c, -c, 1, 0);
      ctx.quadraticCurveTo(c, c, 0, 1);
      ctx.quadraticCurveTo(-c, c, -1, 0);
      ctx.quadraticCurveTo(-c, -c, 0, -1);
      ctx.closePath();
    }

    function frame(now) {
      var steps = Math.min((now - lastTime) / FRAME_MS, 3);
      lastTime = now;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      var alive = [];
      for (var i = 0; i < sparkles.length; i++) {
        var s = sparkles[i];
        s.x += s.vx * steps;
        s.y += s.vy * steps;
        s.vy += GRAVITY * steps;
        s.rot += s.spin * steps;
        s.life -= steps;
        if (s.life <= 0) { continue; }
        alive.push(s);

        var ratio = s.life / s.maxLife;
        var scale = s.size * ratio;
        ctx.setTransform(Math.cos(s.rot) * scale * dpr, Math.sin(s.rot) * scale * dpr,
          -Math.sin(s.rot) * scale * dpr, Math.cos(s.rot) * scale * dpr, s.x * dpr, s.y * dpr);
        ctx.globalAlpha = ratio;
        ctx.fillStyle = s.color;
        star(0.16);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      sparkles = alive;

      if (sparkles.length) {
        requestAnimationFrame(frame);
      } else {
        running = false;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    window.addEventListener('mousemove', function (e) {
      if (lastX !== null) {
        travelled += Math.hypot(e.clientX - lastX, e.clientY - lastY);
        while (travelled >= SPAWN_DISTANCE) {
          travelled -= SPAWN_DISTANCE;
          spawn(e.clientX, e.clientY);
        }
      }
      lastX = e.clientX;
      lastY = e.clientY;
    }, true);
    document.addEventListener('mouseleave', function () { lastX = lastY = null; travelled = 0; });
  }

  if (document.body) { start(); } else { document.addEventListener('DOMContentLoaded', start); }
})();
