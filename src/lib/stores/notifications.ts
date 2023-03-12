import { createClog } from '@marianmeres/clog';
import { createStore } from '@marianmeres/store';

type stringify = () => string;

// human readable label (or i18n like shape { locale: label }, or fn )
type Label = string | Record<string, string> | stringify | object;

type onEventFn = (
	eventName: string,
	data: any,
	self: Notification,
	all: Notification[]
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
	// for sorting in the stack, will default to now
	created?: Date;
	// action handler for triggered actions...
	on?: onEventFn;
	// optional (but conventional) render config, in shape `{ component, props }`
	render?: RenderProps;
}

type NotificationParam = Notification | string;

interface CreateNotiticationStoreOptions {
	// maximum number of notifications kept in the stack, if exceeded, older ones (by `created`)
	// will be discarded.
	// Use 0 (zero) to disable capacity check
	maxCapacity: number;
	// default value for Notification.type, defaults to "info"
	defaultType: string;
	// debug
	logger: (...v) => void;
}

const isFn = (v: any) => typeof v === 'function';

const DEFAULT_OPTIONS: Partial<CreateNotiticationStoreOptions> = {
	maxCapacity: 5,
	defaultType: 'info',
	logger: createClog('notifications'),
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
	if (isNaN(options.maxCapacity) || options.maxCapacity < 0) {
		_log(`WARN: invalid maxCapacity option, falling back to default`);
		options.maxCapacity = DEFAULT_OPTIONS.maxCapacity;
	}

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

	//
	function findById(id: string): Notification {
		const notifs = _store.get();
		const idx = _findIndexById(notifs, id);
		return idx > -1 ? notifs[idx] : null;
	}

	function event(id: string, eventName: string, data: any = null) {
		const n = findById(id);
		if (n && isFn(n.on)) {
			n.on(eventName, data, n, _store.get());
			return true;
		}
		return false;
	}

	return {
		subscribe: _store.subscribe,
		//
		add: (notif: NotificationParam[] | NotificationParam) => {
			if (!Array.isArray(notif)) notif = [notif];
			let notifs = _store.get();
			notif.forEach((n) => (notifs = _add(notifs, n, (_n) => event(_n.id, 'create'))));
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
				event(id, 'remove');
				_store.set(_removeByIdx(notifs, idx));
				return true;
			}
			return false;
		},
		options: { ...options },
	};
};
