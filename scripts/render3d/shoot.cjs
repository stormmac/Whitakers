// node shoot.cjs [names...]  — renders each piece to ../../assets/designs/<name>.png (needs: python3 -m http.server 8765 here)
const { chromium } = require('playwright');
const ALL = ['before-cluster','sapphire','before-deco','marquise','before-illusion','oval','before-brooch','hidden-halo','before-band','after-trilogy','before-onyx','after-onyx-ridged','before-filigree','after-emerald-bypass','before-emerald-cluster','after-emerald-circle'];
const out = process.env.OUT || __dirname + '/out/';
(async () => {
  const names = process.argv.slice(2).length ? process.argv.slice(2) : ALL;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
  p.on('pageerror', (e) => console.log('ERR', e.message));
  p.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
  for (const n of names) {
    await p.goto('about:blank');
    await p.goto('http://localhost:8765/render.html#' + n);
    await p.waitForFunction('window.done === true', null, { timeout: 120000 });
    await p.locator('canvas').screenshot({ path: out + n + '.png' });
    console.log('ok', n);
  }
  await b.close();
})();
