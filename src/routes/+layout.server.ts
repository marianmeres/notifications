import fs from 'node:fs';

const VERSION = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;

export async function load() {
	return { VERSION };
}
