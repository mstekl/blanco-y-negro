// publicar.mjs — Puts the game on the internet, in BOTH places at once:
//   1. Vercel  (https://blanco-y-negro.vercel.app)
//      Vercel builds the game by itself every time the "main" branch changes on GitHub,
//      so we only have to put our work into main and send main to GitHub.
//   2. GitHub Pages  (https://mstekl.github.io/blanco-y-negro/)
//      It shows whatever is in the "gh-pages" branch, so we save the finished
//      game (the "dist" folder) there.
// Run it with: npm run publicar   (it builds the game first)
import { execSync } from 'node:child_process';
import { writeFileSync, rmSync } from 'node:fs';

// Run a git command in the project and show what it does
function git(command) {
  execSync(`git ${command}`, { stdio: 'inherit' });
}

// Run a git command in the project and give back what it answers (as text)
function ask(command) {
  return execSync(`git ${command}`).toString().trim();
}

// Run a git command inside the dist folder
function gitDist(command) {
  execSync(`git ${command}`, { cwd: 'dist', stdio: 'inherit' });
}

// ---------------------------------------------------------------
// Step 0: everything must be saved (committed) first.
// If not, the two pages would end up different: GitHub Pages would get the
// unsaved changes (they are in dist) but Vercel would not (it only sees main).
// ---------------------------------------------------------------
if (ask('status --porcelain') !== '') {
  console.log('\n¡Espera! Hay cambios sin guardar en git. Guárdalos (commit) y vuelve a correr npm run publicar.');
  process.exit(1);
}

// ---------------------------------------------------------------
// Step 1: Vercel — put our branch into main and send main to GitHub
// ---------------------------------------------------------------
const branch = ask('rev-parse --abbrev-ref HEAD');
git(`push -q origin ${branch}`); // our branch is backed up on GitHub too

if (branch !== 'main') {
  git('fetch -q origin main');
  git('checkout -q main');
  try {
    git('merge -q --ff-only origin/main'); // first catch up with what is on GitHub
    git(`merge -q --no-edit ${branch}`);   // then add our work
  } catch (e) {
    // Two changes touched the same lines: a person has to decide, so we stop
    try { execSync('git merge --abort', { stdio: 'ignore' }); } catch (e2) { /* nothing to undo */ }
    git(`checkout -q ${branch}`);
    console.log(`\nNo pude juntar ${branch} con main (hay cambios que chocan). Pide ayuda para juntarlas.`);
    process.exit(1);
  }
  git('push -q origin main');
  git(`checkout -q ${branch}`); // go back to the branch we were working on
} else {
  git('push -q origin main');
}

// ---------------------------------------------------------------
// Step 2: GitHub Pages — save the finished game in the gh-pages branch
// ---------------------------------------------------------------

// This empty file tells GitHub "just show these files as they are"
writeFileSync('dist/.nojekyll', '');

// dist is a brand-new little repository every time: we only need the latest game,
// not its history, so we replace the gh-pages branch completely (--force)
// (Vite does not erase the old dist/.git when it builds, so we erase it ourselves)
const url = ask('remote get-url origin');
rmSync('dist/.git', { recursive: true, force: true });
gitDist('init -q -b gh-pages');
gitDist('add -A');
gitDist('commit -q -m "Publicar el juego"');
gitDist(`push -q --force ${url} gh-pages`);

console.log('\n¡Listo! En un minuto el juego está en:');
console.log('  https://blanco-y-negro.vercel.app');
console.log('  https://mstekl.github.io/blanco-y-negro/');
