/** @typedef {typeof __propDef.props}  NotificationsProps */
/** @typedef {typeof __propDef.events}  NotificationsEvents */
/** @typedef {typeof __propDef.slots}  NotificationsSlots */
export default class Notifications extends SvelteComponent<{
    notifications: any;
    posX?: string;
    posXMobile?: string;
    posY?: string;
    posYMobile?: string;
    wrapPosition?: string;
    wrapPadding?: string;
    wrapZIndex?: string;
    wrapClass?: string;
    wrapCss?: string;
    notifClass?: string;
    notifCss?: string;
    ariaCloseLabel?: string;
    theme?: string;
    themeVars?: {};
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type NotificationsProps = typeof __propDef.props;
export type NotificationsEvents = typeof __propDef.events;
export type NotificationsSlots = typeof __propDef.slots;
import { SvelteComponent } from "svelte";
declare const __propDef: {
    props: {
        notifications: any;
        posX?: string;
        posXMobile?: string;
        posY?: string;
        posYMobile?: string;
        wrapPosition?: string;
        wrapPadding?: string;
        wrapZIndex?: string;
        wrapClass?: string;
        wrapCss?: string;
        notifClass?: string;
        notifCss?: string;
        ariaCloseLabel?: string;
        theme?: string;
        themeVars?: {};
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
