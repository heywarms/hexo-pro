'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const Hexo = require('hexo');

const pluginEntry = path.resolve(__dirname, '..', 'index.js');

function writeFile(baseDir, relative, content) {
  const file = path.join(baseDir, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function useTheme(baseDir, theme) {
  writeFile(baseDir, '_config.yml', `title: Lifecycle\ntheme: ${theme}\n`);
}

function createBlog(t) {
  const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hexo-pro-lifecycle-'));
  t.after(() => fs.rmSync(baseDir, { recursive: true, force: true }));
  // Hexo only treats a directory as a blog when package.json has a `hexo` key.
  writeFile(baseDir, 'package.json', JSON.stringify({ name: 'lifecycle-blog', hexo: { version: '' } }));
  // No Markdown renderer is installed here; Hexo renders .html posts by itself.
  writeFile(baseDir, 'source/_posts/hello.html', '---\ntitle: Hello\n---\nBody\n');
  writeFile(baseDir, 'themes/first/source/only-first.css', 'body {}\n');
  writeFile(baseDir, 'themes/second/source/only-second.css', 'body {}\n');
  useTheme(baseDir, 'first');
  return baseDir;
}

// `command` is what hexo-cli passes to the Hexo constructor; `hexo -v` and the
// desktop app pass none.
async function startHexo(baseDir, command) {
  const hexo = new Hexo(baseDir, { _: command ? [command] : [], silent: true });
  // hexo-server is only installed in the blog, but its name must resolve here.
  hexo.extend.console.register('server', 'Stub for hexo-server', async () => {});
  await hexo.loadPlugin(pluginEntry);
  await hexo.init();
  return hexo;
}

async function run(baseDir, command) {
  const hexo = await startHexo(baseDir, command);
  await hexo.call(command, {});
  await hexo.exit();
}

const exists = (baseDir, relative) => fs.existsSync(path.join(baseDir, relative));

for (const command of ['clean', 'cl']) {
  test(`hexo ${command} leaves db.json and public deleted after Hexo exits`, async (t) => {
    const baseDir = createBlog(t);
    await run(baseDir, 'generate');
    assert.ok(exists(baseDir, 'db.json'));
    assert.ok(exists(baseDir, 'public'));

    await run(baseDir, command);

    assert.equal(exists(baseDir, 'db.json'), false);
    assert.equal(exists(baseDir, 'public'), false);
  });
}

test('assets of the previous theme are gone after a theme change and hexo clean', async (t) => {
  const baseDir = createBlog(t);
  await run(baseDir, 'generate');
  assert.ok(exists(baseDir, 'public/only-first.css'));

  useTheme(baseDir, 'second');
  await run(baseDir, 'clean');
  await run(baseDir, 'generate');

  assert.ok(exists(baseDir, 'public/only-second.css'));
  assert.equal(exists(baseDir, 'public/only-first.css'), false);
  const assets = JSON.parse(fs.readFileSync(path.join(baseDir, 'db.json'), 'utf8')).models.Asset;
  assert.deepEqual(assets.map(asset => asset._id), ['themes/second/source/only-second.css']);
});

for (const command of ['server', 's']) {
  test(`hexo ${command} has site data before server_middleware runs`, async (t) => {
    const baseDir = createBlog(t);

    const hexo = await startHexo(baseDir, command);

    assert.deepEqual(hexo.model('Post').map(post => post.title), ['Hello']);
    const index = JSON.parse(fs.readFileSync(path.join(baseDir, 'blogInfoList.json'), 'utf8'));
    assert.deepEqual(index.map(item => item.title), ['Hello']);
    await hexo.exit();
  });
}

test('no command does not process the site until the caller loads it', async (t) => {
  const baseDir = createBlog(t);

  const hexo = await startHexo(baseDir);

  // A theme that shells out to `hexo -v` while generating must not recurse.
  assert.equal(hexo.model('Post').length, 0);
  assert.equal(exists(baseDir, 'blogInfoList.json'), false);

  await hexo.load();
  assert.deepEqual(hexo.model('Post').map(post => post.title), ['Hello']);
  assert.ok(exists(baseDir, 'blogInfoList.json'));
  await hexo.exit();
});
