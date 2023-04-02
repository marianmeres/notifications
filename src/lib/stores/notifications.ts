import { createClog } from '@marianmeres/clog';
import { createStore } from '@marianmeres/store';
import { createTicker } from '@marianmeres/ticker';

type stringify = () => string;

// human readable label (or i18n like shape { locale: label }, or fn )
type Label = string | Record<string, string> | stringify | object;

type SortOrder = 'asc' | 'desc';

type onEventFn = (
	eventName: string,
	self: Notification,
	all: Notification[],
	data: any
) => void;

interface RenderProps {
	component: Function;
	props?: any;
}

interface Notification extends Record<string, any> {
	// unique id of the notification. If not provided, will be calculated from content.
	// Multiple notifications with the same id will be ignored (but the `count` will be increased)
	id: any;

	// optional UI rendering well known hint (has no effect on the functionality, can be
	// any string), defaults to "info"
	type: string;

	// the actual notification message (either plain text, or rich html)
	// notifications without any label will be ignored
	text: Label;
	html: Label;

	// for sorting the queue, will default to now
	created: Date;

	// generic action handler for triggered actions...
	on: onEventFn;

	// Same as `on('click', ...)` except that UI may detect if this exists (e.g. show
	// pointer cursor), which would not be possible for `on('click', ...)`
	onClick: (self: Notification, all: Notification[], data: any) => void;

	// notification specific time-to-live in seconds (after which notif will be auto discarded)
	// use 0 to disable auto disposal
	ttl: number;

	// Number of notifications in the queue with the same `id`. If you do not provide your
	// own id, it will be calculated from content (type, text, html).
	count: number;

	// optional (but conventional) render config, in shape `{ component, props }`
	component: Function | RenderProps;

	//
	icon: Function | boolean;
}

type NotificationParam = Partial<Notification> | string;

interface CreateNotiticationStoreOptions {
	// Maximum number of notifications kept in the queue, if exceeded, older ones (by `created`)
	// will be discarded.
	// Use 0 (zero) to disable capacity check
	maxCapacity: number;

	// Default value for Notification.type, defaults to "info".
	defaultType: string;

	// Global time-to-live in seconds (after which notifs will be auto discarded)
	// Use 0 to disable default auto disposal.
	defaultTtl: number;

	// How to sort the queue, "asc" (default) or "desc".
	// Sorting is always done by the `created` prop.
	sortOrder?: SortOrder;

	// boolean to dis/allow default icons, or
	// custom type-to-fn map (function should return svg string)
	defaultIcons?: Record<string, Function> | boolean;

	// debug
	logger: (...v) => void;
}

const isFn = (v: any) => typeof v === 'function';

const DEFAULT_OPTIONS: Partial<CreateNotiticationStoreOptions> = {
	maxCapacity: 5,
	defaultTtl: 10,
	defaultType: 'info',
	sortOrder: 'asc',
	defaultIcons: true,
	logger: createClog('notifications'),
};

const EVENT = {
	CLICK: 'click',
	CREATE: 'create',
	// `remove` programatically, or e.g. by clicking on X
	REMOVE: 'remove',
	// triggered when auto disposed by ttl expiration
	AUTO_DISPOSE: 'auto_dispose',
	// usefull for detecting interacion (so internally may notify as "seen")
	MOUSEOVER: 'mouseover',
};

// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
const _strHash = (str) =>
	str.split('').reduce((a, b) => {
		a = (a << 5) - a + b.charCodeAt(0);
		return a & a;
	}, 0);

const _id = (type, content) => ['id', type, _strHash(content)].join('-');

export const createNotificationsStore = (
	initial: NotificationParam[] = [],
	options: Partial<CreateNotiticationStoreOptions> = {}
) => {
	if (!Array.isArray(initial)) initial = [initial];

	const _log = (...v) => (isFn(options.logger) ? options.logger.apply(null, v) : null);

	// merge provided with defaults
	options = { ...DEFAULT_OPTIONS, ...(options || {}) };

	const _setOption = (k, v) => {
		// _log(`INFO: setting option '${k} = ${v}'`);
		if (/^maxCapacity|defaultTtl$/.test(k)) {
			v = parseInt(v, 10);
			if (isNaN(v) || v < 0) {
				_log(`WARN: invalid '${k}' option, falling back to default`);
				options[k] = DEFAULT_OPTIONS[k];
			} else {
				options[k] = v;
			}
		} else {
			options[k] = v;
		}
	};

	// sanitize options
	['maxCapacity', 'defaultTtl'].forEach((k) => _setOption(k, options[k]));

	const _factory = (notif: string | NotificationParam) => {
		if (typeof notif === 'string') {
			notif = { id: 0, text: notif };
		}

		// ignore invalid (empty) notifs
		if (!notif.text && !notif.html) {
			_log(`WARN: ignoring empty notification`);
			return null;
		}

		notif.type ||= options.defaultType; //
		notif.id ||= _id(notif.type, [notif.text, notif.html].join());
		notif.created = new Date(notif.created || Date.now());
		notif.count = 1;

		//
		if (notif.ttl === undefined) notif.ttl = options.defaultTtl;
		if (notif.icon === undefined) {
			if (typeof options.defaultIcons === 'boolean') {
				notif.icon = options.defaultIcons;
			} else {
				notif.icon = options.defaultIcons[notif.type];
			}
		}

		return notif;
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

	const _add = (
		notifs: Notification[],
		notif: NotificationParam | string,
		onAddHook: Function = null
	) => {
		notif = _factory(notif);

		// return early on invalid
		if (!notif) return notifs;

		const _isDesc = options.sortOrder === 'desc';

		const idx = _findIndexById(notifs, notif.id);
		if (idx > -1) {
			notifs[idx].count++;
			notifs[idx].created = new Date(
				Math.max(notifs[idx].created.valueOf(), notif.created.valueOf())
			);
		} else {
			notifs.push(notif as any);
			notifs.sort((a, b) => {
				let _a = a.created.valueOf();
				let _b = b.created.valueOf();
				return _isDesc ? _b - _a : _a - _b;
			});
		}

		if (isFn(onAddHook)) onAddHook(notif);

		// keep only `maxCapacity` in the queue
		if (options.maxCapacity && notifs.length > options.maxCapacity) {
			notifs = _isDesc
				? notifs.slice(0, options.maxCapacity)
				: notifs.slice(-1 * options.maxCapacity);
		}

		return [...notifs];
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
		if (n) {
			if (isFn(n.on)) {
				n.on(eventName, n, _store.get(), data);
			}
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
		// some options setters (for playground mostly)
		setMaxCapacity: (v) => _setOption('maxCapacity', v),
		setSortOrder: (v) => _setOption('sortOrder', v),
	};
};
