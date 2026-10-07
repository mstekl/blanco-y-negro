// publicar.mjs — Puts the game on the internet (GitHub Pages).
// Run it with: npm run publicar   (it builds the game first)
// It takes the finished game in "dist" and saves it in the "gh-pages" branch
// on GitHub. GitHub Pages shows whatever is in that branch as a web page,
// so after a minute the game is at https://mstekl.github.io/blanco-y-negro/
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

// Run a git command inside the dist folder and show what it does
function git(command) {
  execSync(`git ${command}`, { cwd: 'dist', stdio: 'inherit' });
}

// This empty file tells GitHub "just show these files as they are"
writeFileSync('dist/.nojekyll', '');

// dist is a brand-new little repository every time: we only need the latest game,
// not its history, so we replace the gh-pages branch completely (--force)
const url = execSync('git remote get-url origin').toString().trim();
git('init -q -b gh-pages');
git('add -A');
git('commit -q -m "Publicar el juego"');
git(`push -q --force ${url} gh-pages`);

console.log('\n¡Listo! En un minuto el juego está en https://mstekl.github.io/blanco-y-negro/');
