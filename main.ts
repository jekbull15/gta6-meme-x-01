// gta6-meme-x-01 entry program (Node 22, standard library only).
//
// The entry is the X post itself; this program's only job is to hand the
// grader the post's address. It reads POST.json at the repository root,
// checks that the file parses as a JSON object whose "url" is an X post
// address, and then copies the file byte for byte to POST.json in the
// output directory, where the gate reads it. On success it prints nothing.
//
// MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand in for /bot and /output
// when the program runs outside the grader's container:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const botDir = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const postPath = join(botDir, 'POST.json');

let raw: string;
try {
  raw = await readFile(postPath, 'utf8');
} catch (err) {
  console.error(`POST.json could not be read from ${postPath}: ${(err as Error).message}`);
  process.exit(1);
}

let post: unknown;
try {
  post = JSON.parse(raw);
} catch {
  console.error('POST.json is not valid JSON');
  process.exit(1);
}

const url = (post as { url?: unknown } | null)?.url;
// A post's address is /<handle>/status/<id>; X also serves the same post
// under /i/web/status/<id>, and the house reads that shape too.
const POST_URL = /^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/([^/]+\/status\/\d+|i\/web\/status\/\d+)$/;
if (typeof url !== 'string' || !POST_URL.test(url)) {
  console.error('POST.json does not name an X post address');
  process.exit(1);
}

await mkdir(outputDir, { recursive: true });
await copyFile(postPath, join(outputDir, 'POST.json'));
