import { createClog } from '@marianmeres/clog';
import { createStore } from '@marianmeres/store';
import { createTicker } from '@marianmeres/ticker';
const isFn = (v) => typeof v === 'function';
const DEFAULT_OPTIONS = {
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
const _strHash = (str) => str.split('').reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
}, 0);
const _id = (type, content) => ['id', type, _strHash(content)].join('-');
export const createNotificationsStore = (initial = [], options = {}) => {
    if (!Array.isArray(initial))
        initial = [initial];
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
            }
            else {
                options[k] = v;
            }
        }
        else {
            options[k] = v;
        }
    };
    // sanitize options
    ['maxCapacity', 'defaultTtl'].forEach((k) => _setOption(k, options[k]));
    const _factory = (notif) => {
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
        if (notif.ttl === undefined)
            notif.ttl = options.defaultTtl;
        if (notif.icon === undefined) {
            if (typeof options.defaultIcons === 'boolean') {
                notif.icon = options.defaultIcons;
            }
            else {
                notif.icon = options.defaultIcons[notif.type];
            }
        }
        return notif;
    };
    const _findIndexById = (notifs, id) => notifs.findIndex((n) => n.id === id);
    const _removeByIdx = (notifs, idx) => {
        if (idx > -1) {
            notifs.splice(idx, 1);
            notifs = [...notifs];
        }
        return notifs;
    };
    const _add = (notifs, notif, onAddHook = null) => {
        notif = _factory(notif);
        // return early on invalid
        if (!notif)
            return notifs;
        const _isDesc = options.sortOrder === 'desc';
        const idx = _findIndexById(notifs, notif.id);
        if (idx > -1) {
            notifs[idx].count++;
            notifs[idx].created = new Date(Math.max(notifs[idx].created.valueOf(), notif.created.valueOf()));
        }
        else {
            notifs.push(notif);
            notifs.sort((a, b) => {
                let _a = a.created.valueOf();
                let _b = b.created.valueOf();
                return _isDesc ? _b - _a : _a - _b;
            });
        }
        if (isFn(onAddHook))
            onAddHook(notif);
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
        // some options setters (for playground mostly)
        setMaxCapacity: (v) => _setOption('maxCapacity', v),
        setSortOrder: (v) => _setOption('sortOrder', v),
    };
};
