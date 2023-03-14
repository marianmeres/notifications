import { createClog } from '@marianmeres/clog';
import { createStore } from '@marianmeres/store';
import { createTicker } from '@marianmeres/ticker';

type stringify = () => string;

// human readable label (or i18n like shape { locale: label }, or fn )
type Label = string | Record<string, string> | stringify | object;

type onEventFn = (
	eventName: string,
	self: Notification,
	all: Notification[],
	data: any,
) => void;

interface RenderProps {
	component: Function;
	props?: any;
}

interface Notification extends Record<string, any> {
	// unique id of the notif. Multiple notifications with the same id will be
	// ignored
	id: any;
	// optional UI rendering well known hint (has no effect on the functionality, can be
	// any string), defaults to "info"
	type?: string;
	// the actual notification message (either plain text, or rich html)
	// notifications without any label will be ignored
	text?: Label;
	html?: Label;
	// for sorting in the queue, will default to now
	created?: Date;
	// generic action handler for triggered actions...
	on?: onEventFn;
	// functionally same as `on('click', ...)` except that ui may render differently if
	// this exists (e.g. show pointer cursor), which would not be possible for `on('click', ...)`
	onClick?: (self: Notification, all: Notification[], data: any) => void;
	// notification specific time-to-live in seconds (after which notif will be auto discarded)
	// use 0 to disable auto disposal
	ttl?: number;
	// optional (but conventional) render config, in shape `{ component, props }`
	component?: Function | RenderProps;
}

type NotificationParam = Notification | string;

interface CreateNotiticationStoreOptions {
	// maximum number of notifications kept in the queue, if exceeded, older ones (by `created`)
	// will be discarded.
	// Use 0 (zero) to disable capacity check
	maxCapacity: number;
	// default value for Notification.type, defaults to "info"
	defaultType: string;
	// global time-to-live in seconds (after which notifs will be auto discarded)
	// use 0 to disable default auto disposal
	defaultTtl: number;
	// debug
	logger: (...v) => void;
}

const isFn = (v: any) => typeof v === 'function';

const DEFAULT_OPTIONS: Partial<CreateNotiticationStoreOptions> = {
	maxCapacity: 5,
	defaultTtl: 10,
	defaultType: 'info',
	logger: createClog('notifications'),
};

const EVENT = {
	CLICK: 'click',
	CREATE: 'create',
	// `remove` programatically, or e.g. by clicking on X
	REMOVE: 'remove',
	// to be auto disposed by ttl expiration
	AUTO_DISPOSE: 'auto_dispose',
	MOUSEOVER: 'mouseover',
};

export const createNotificationsStore = (
	initial: NotificationParam[] = [],
	options: Partial<CreateNotiticationStoreOptions> = {}
) => {
	if (!Array.isArray(initial)) initial = [initial];

	const _log = (...v) => (isFn(options.logger) ? options.logger.apply(null, v) : null);
	const _id = () => `notif-${Math.random().toString(36).slice(2)}`;

	// merge provided with defaults
	options = { ...DEFAULT_OPTIONS, ...(options || {}) };

	// sanitize options
	['maxCapacity', 'defaultTtl'].forEach((prop) => {
		options[prop] = parseInt(options[prop], 10);
		if (isNaN(options[prop]) || options[prop] < 0) {
			_log(`WARN: invalid '${prop}' option, falling back to default`);
			options[prop] = DEFAULT_OPTIONS[prop];
		}
	});

	const _factory = (notif: string | Notification) => {
		if (typeof notif === 'string') {
			notif = { id: _id(), text: notif };
		}

		// ignore invalid (empty) notifs
		if (!notif.text && !notif.html) {
			_log(`WARN: ignoring empty notification`);
			return null;
		}

		notif.id ||= _id();
		notif.type ||= options.defaultType; //
		notif.created = new Date(notif.created || Date.now());

		//
		if (notif.ttl === undefined) notif.ttl = options.defaultTtl;

		return notif;
	};

	const _findIndex = (notifs, notif) => {
		notif = _factory(notif);
		return notif ? _findIndexById(notifs, notif.id) : -1;
	};

	const _findIndexById = (notifs: Notification[], id: any) =>
		notifs.findIndex((n) => n.id === id);

	const _removeByIdx = (notifs: Notification[], idx: number) => {
		if (idx > -1) {
			notifs.splice(idx, 1);
			notifs = [...notifs];
		}
		return notifs;
	};

	const _contains = (notifs: Notification[], notif: Notification) =>
		_findIndex(notifs, notif) > -1;

	const _add = (
		notifs: Notification[],
		notif: Notification | string,
		onAddHook: Function = null
	) => {
		notif = _factory(notif);
		let changed = 0;

		if (notif && !_contains(notifs, notif)) {
			notifs.push(notif);
			notifs.sort((a, b) => a.created.valueOf() - b.created.valueOf());
			if (isFn(onAddHook)) onAddHook(notif);
			changed++;
		}

		// keep only `maxCapacity` most recent
		if (options.maxCapacity && notifs.length > options.maxCapacity) {
			notifs = notifs.slice(-1 * options.maxCapacity);
			changed++;
		}

		return changed ? [...notifs] : notifs;
	};

	// main internal store
	let notifs = [];
	initial.forEach((n) => (notifs = _add(notifs, n)));
	const _store = createStore(notifs);

	// auto dispose feature
	const ticker = createTicker(1_000);
	const _tickerInit = () => {
		const _tickerUnsub = ticker.start().subscribe((ts) => {
			if (ts) {
				const { disposed, kept } = _store.get().reduce(
					(memo, n) => {
						if (n.ttl) {
							const expiry = n.created.valueOf() + n.ttl * 1000;
							expiry >= Date.now() ? memo.kept.push(n) : memo.disposed.push(n);
						} else {
							memo.kept.push(n);
						}
						return memo;
					},
					{ disposed: [], kept: [] }
				);

				if (disposed.length) {
					disposed.forEach((n) => event(n.id, EVENT.AUTO_DISPOSE));
					_store.set(kept);
				}
			}
		});
		return () => {
			ticker.stop();
			_tickerUnsub();
		};
	};

	//
	function findById(id: string): Notification {
		const notifs = _store.get();
		const idx = _findIndexById(notifs, id);
		return idx > -1 ? notifs[idx] : null;
	}

	function event(id: string, eventName: string, data: any = null) {
		const n = findById(id);
		if (n && isFn(n.on)) {
			n.on(eventName, n, _store.get(), data);
			if (eventName === EVENT.CLICK && isFn(n.onClick)) {
				n.onClick(n, _store.get(), data);
			}
			return true;
		}
		return false;
	}

	// we need to keep track of subscriptions count, so we can do the cleanup
	let _subsCount = 0;
	let _tickerDestroy;
	const subscribe = (cb) => {
		if (!_subsCount++) _tickerDestroy = _tickerInit();
		const unsub = _store.subscribe(cb);
		return () => {
			if (!--_subsCount) _tickerDestroy();
			unsub();
		};
	};

	return {
		subscribe,
		//
		get: (): Notification[] => _store.get(),
		//
		add: (notif: NotificationParam[] | NotificationParam) => {
			if (!Array.isArray(notif)) notif = [notif];
			let notifs = _store.get();
			notif.forEach(
				(n) => (notifs = _add(notifs, n, (_n) => event(_n.id, EVENT.CREATE)))
			);
			_store.set(notifs);
		},
		//
		event,
		//
		find: findById,
		//
		remove: (id: string) => {
			let notifs = _store.get();
			const idx = _findIndexById(notifs, id);
			if (idx > -1) {
				const notif = notifs[idx];
				event(id, EVENT.REMOVE);
				_store.set(_removeByIdx(notifs, idx));
				return true;
			}
			return false;
		},
		//
		options: { ...options },
		//
		EVENT,
	};
};
