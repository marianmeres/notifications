import path from 'path';
import { TestRunner } from '@marianmeres/test-runner';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const verbose = args.includes('-v');
const whitelist = args.filter((v) => !/^-v$/.test(v));

TestRunner.runAll(__dirname, {
	whitelist,
	verbose,
	rootDir: __dirname,
	enableErrorsSummaryOnNonVerbose: true,
}).then();
