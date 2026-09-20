const fs = require('fs');
const path = require('path');
const http = require('http');

const html = fs.readFileSync('index.html', 'utf8');
const appjs = fs.readFileSync('js/app.js', 'utf8');
const audiojs = fs.readFileSync('js/audio-player.js', 'utf8');
const css = fs.readFileSync('css/style.css', 'utf8');

let allOk = true;

function check(condition, label) {
  console.log(condition ? '  ✓ ' + label : '  ✗ FAILED: ' + label);
  if (!condition) allOk = false;
}

console.log('=== 1. Physical Files in public/assets/ ===');
const expectedFiles = [
  'public/assets/images/white-lily.svg',
  'public/assets/images/temple-icon.svg',
  'public/assets/images/lake-icon.svg',
  'public/assets/images/mall-icon.svg',
  'public/assets/images/beach-icon.svg',
  'public/assets/photos/photo1.jpg',
  'public/assets/photos/photo2.jpg',
  'public/assets/photos/photo3.jpg',
  'public/assets/music/thozhi.mp3'
];

expectedFiles.forEach(relPath => {
  const fullPath = path.join(__dirname, relPath);
  const exists = fs.existsSync(fullPath);
  const size = exists ? fs.statSync(fullPath).size : 0;
  check(exists && size > 0, relPath + ' (' + size + ' bytes)');
});

console.log('\n=== 2. Exact Case & No Conflicting Assets in Root ===');
check(!fs.existsSync(path.join(__dirname, 'assets')), 'Old assets/ directory removed from root');
check(!fs.existsSync(path.join(__dirname, 'photo1.jpg.jpeg')), 'photo1.jpg.jpeg removed from root');
check(!fs.existsSync(path.join(__dirname, 'photo2.jpg.jpeg')), 'photo2.jpg.jpeg removed from root');
check(!fs.existsSync(path.join(__dirname, 'photo3.jpg.jpeg')), 'photo3.jpg.jpeg removed from root');
check(!fs.existsSync(path.join(__dirname, 'website audio gift.mpeg')), 'website audio gift.mpeg removed from root');

console.log('\n=== 3. HTML/JS Exact Path References ===');
check(html.includes('src="/assets/images/white-lily.svg"'), 'Lily image uses /assets/images/white-lily.svg');
check(html.includes('src="/assets/images/temple-icon.svg"'), 'Temple icon uses /assets/images/temple-icon.svg');
check(html.includes('src="/assets/images/lake-icon.svg"'), 'Lake icon uses /assets/images/lake-icon.svg');
check(html.includes('src="/assets/images/mall-icon.svg"'), 'Mall icon uses /assets/images/mall-icon.svg');
check(html.includes('src="/assets/images/beach-icon.svg"'), 'Beach icon uses /assets/images/beach-icon.svg');
check(html.includes('src="/assets/photos/photo1.jpg"'), 'Photo 1 uses /assets/photos/photo1.jpg');
check(html.includes('src="/assets/photos/photo2.jpg"'), 'Photo 2 uses /assets/photos/photo2.jpg');
check(html.includes('src="/assets/photos/photo3.jpg"'), 'Photo 3 uses /assets/photos/photo3.jpg');
check(audiojs.includes('/assets/music/thozhi.mp3'), 'Audio player uses /assets/music/thozhi.mp3');

console.log('\n=== 4. Photo Display & Aspect Ratio (No Crop) ===');
check(css.includes('object-fit: contain'), 'CSS includes object-fit: contain for polaroids');

console.log('\n=== 5. HTTP 200 Live Verification ===');
const urls = [
  '/',
  '/assets/images/white-lily.svg',
  '/assets/images/temple-icon.svg',
  '/assets/images/lake-icon.svg',
  '/assets/images/mall-icon.svg',
  '/assets/images/beach-icon.svg',
  '/assets/photos/photo1.jpg',
  '/assets/photos/photo2.jpg',
  '/assets/photos/photo3.jpg',
  '/assets/music/thozhi.mp3',
  '/css/style.css',
  '/js/app.js',
  '/js/audio-player.js',
  '/js/canvas-particles.js'
];

let pending = urls.length;
urls.forEach(u => {
  http.get('http://localhost:3000' + u, res => {
    const ok = res.statusCode === 200;
    check(ok, u + ' -> HTTP ' + res.statusCode + ' (' + res.headers['content-type'] + ')');
    pending--;
    if (pending === 0) {
      console.log('\n=== Overall Result ===');
      if (allOk) {
        console.log('SUCCESS: All checks PASSED! ZERO 404 errors!');
        process.exit(0);
      } else {
        console.error('FAILURE: Some checks failed!');
        process.exit(1);
      }
    }
  }).on('error', err => {
    check(false, u + ' request failed: ' + err.message);
    pending--;
    if (pending === 0) process.exit(1);
  });
});
