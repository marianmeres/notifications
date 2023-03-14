import { createClog } from '@marianmeres/clog';
import { createStore } from '@marianmeres/store';
import { createTicker } from '@marianmeres/ticker';
const isFn = (v) => typeof v === 'function';
const DEFAULT_OPTIONS = {
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
export const createNotificationsStore = (initial = [], options = {}) => {
    if (!Array.isArray(initial))
        initial = [initial];
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
    const _factory = (notif) => {
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
        if (notif.ttl === undefined)
            notif.ttl = options.defaultTtl;
        return notif;
    };
    const _findIndex = (notifs, notif) => {
        notif = _factory(notif);
        return notif ? _findIndexById(notifs, notif.id) : -1;
    };
    const _findIndexById = (notifs, id) => notifs.findIndex((n) => n.id === id);
    const _removeByIdx = (notifs, idx) => {
        if (idx > -1) {
            notifs.splice(idx, 1);
            notifs = [...notifs];
        }
        return notifs;
    };
    const _contains = (notifs, notif) => _findIndex(notifs, notif) > -1;
    const _add = (notifs, notif, onAddHook = null) => {
        notif = _factory(notif);
        let changed = 0;
        if (notif && !_contains(notifs, notif)) {
            notifs.push(notif);
            notifs.sort((a, b) => a.created.valueOf() - b.created.valueOf());
            if (isFn(onAddHook))
                onAddHook(notif);
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
                const { disposed, kept } = _store.get().reduce((memo, n) => {
                    if (n.ttl) {
                        const expiry = n.created.valueOf() + n.ttl * 1000;
                        expiry >= Date.now() ? memo.kept.push(n) : memo.disposed.push(n);
                    }
                    else {
                        memo.kept.push(n);
                    }
                    return memo;
                }, { disposed: [], kept: [] });
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
    function findById(id) {
        const notifs = _store.get();
        const idx = _findIndexById(notifs, id);
        return idx > -1 ? notifs[idx] : null;
    }
    function event(id, eventName, data = null) {
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
        if (!_subsCount++)
            _tickerDestroy = _tickerInit();
        const unsub = _store.subscribe(cb);
        return () => {
            if (!--_subsCount)
                _tickerDestroy();
            unsub();
        };
    };
    return {
        subscribe,
        //
        get: () => _store.get(),
        //
        add: (notif) => {
            if (!Array.isArray(notif))
                notif = [notif];
            let notifs = _store.get();
            notif.forEach((n) => (notifs = _add(notifs, n, (_n) => event(_n.id, EVENT.CREATE))));
            _store.set(notifs);
        },
        //
        event,
        //
        find: findById,
        //
        remove: (id) => {
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
