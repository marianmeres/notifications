/** @typedef {typeof __propDef.props}  NotificationsProps */
/** @typedef {typeof __propDef.events}  NotificationsEvents */
/** @typedef {typeof __propDef.slots}  NotificationsSlots */
export default class Notifications extends SvelteComponentTyped<{
    notifications: any;
    wrapClass?: string;
    wrapCss?: string;
    notifClass?: string;
    notifCss?: string;
    closeLabel?: string;
    theme?: string;
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type NotificationsProps = typeof __propDef.props;
export type NotificationsEvents = typeof __propDef.events;
export type NotificationsSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        notifications: any;
        wrapClass?: string;
        wrapCss?: string;
        notifClass?: string;
        notifCss?: string;
        closeLabel?: string;
        theme?: string;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
