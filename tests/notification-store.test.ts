import path from 'node:path';
import { strict as assert } from 'node:assert';
import { fileURLToPath } from 'node:url';
import { createClog } from '@marianmeres/clog';
import { TestRunner } from '@marianmeres/test-runner';
import { createNotificationsStore } from '../src/lib/index.js';

const clog = createClog(path.basename(fileURLToPath(import.meta.url)));
const suite = new TestRunner(path.basename(fileURLToPath(import.meta.url)));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

suite.test('initial', async () => {
	const store = createNotificationsStore(['foo']);
	store.subscribe((notifs) => {
		assert(notifs.length === 1);
		assert(notifs[0].text === 'foo');
		assert(notifs[0].id);
		assert(notifs[0].created);
		assert(notifs[0].type === store.options.defaultType);
	})();
});

suite.test('add', async () => {
	const store = createNotificationsStore([]);

	store.subscribe((notifs) => {
		assert(!notifs.length);
	})();

	store.add('foo');

	store.subscribe((notifs) => {
		assert(notifs.length === 1);
		assert(notifs[0].text === 'foo');
		assert(notifs[0].id);
		assert(notifs[0].created);
	})();

	const old = { id: 'old', html: 'hoho', created: new Date(0), type: 'custom' };
	store.add(old);

	// test adding multiple times the same notifikation - must be ignored
	store.add(old);

	store.subscribe((notifs) => {
		// clog(notifs);
		// must be 2, not 3
		assert(notifs.length === 2);
		// must be sorted by created descending
		assert(notifs[0].created < notifs[1].created);
		assert(notifs[0] === old); // same instance
		assert(notifs[1].text === 'foo'); // same instance
	})();

	const notif = store.find('old');
	// clog(notif);
	assert(notif === old);

	store.remove(old.id);

	store.subscribe((notifs) => {
		assert(notifs.length === 1);
		assert(notifs[0].text === 'foo');
	})();
});

suite.test('events', async () => {
	let log = [];
	const n = {
		id: 'some-id',
		text: 'some-text',
		on: (eventName, data, self, all) => log.push({ eventName, data, self, all }),
	};

	const store = createNotificationsStore([n, 'foo']);

	store.event(n.id, 'some', 123);
	store.event(n.id, 'another', 456);
	store.event('non-existing', 'another', 456);

	// clog(log);
	assert(log.length === 2);
	assert(log[0].eventName === 'some');
	assert(log[1].data === 456);

	// once removed, no more event listening
	store.remove(n.id);
	log = [];
	store.event(n.id, 'some', 123);
	assert(log.length === 0);
});

suite.test('max capacity', async () => {
	const store = createNotificationsStore([], { maxCapacity: 2 });

	for (let n of 'abcd'.split('')) {
		// so the created by sort makes sense
		await sleep(10);
		store.add(n);
	}

	store.subscribe((notifs) => {
		// clog(notifs);
		assert(notifs.length === 2);
		// first 2 (a, b) must have been ignored
		assert(notifs[0].text === 'c');
		assert(notifs[1].text === 'd');
	})();
});

export default suite;
