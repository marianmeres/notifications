type stringify = () => string;
type Label = string | Record<string, string> | stringify | object;
type SortOrder = 'asc' | 'desc';
type onEventFn = (eventName: string, self: Notification, all: Notification[], data: any) => void;
interface RenderProps {
    component: Function;
    props?: any;
}
interface Notification extends Record<string, any> {
    id: any;
    type: string;
    text: Label;
    html: Label;
    created: Date;
    on: onEventFn;
    onClick: (self: Notification, all: Notification[], data: any) => void;
    ttl: number;
    count: number;
    component: Function | RenderProps;
    icon: Function | boolean;
}
type NotificationParam = Partial<Notification> | string;
interface CreateNotiticationStoreOptions {
    maxCapacity: number;
    defaultType: string;
    defaultTtl: number;
    sortOrder?: SortOrder;
    defaultIcons?: Record<string, Function> | boolean;
    logger: (...v: any[]) => void;
}
export declare const createNotificationsStore: (initial?: NotificationParam[], options?: Partial<CreateNotiticationStoreOptions>) => {
    subscribe: (cb: any) => () => void;
    get: () => Notification[];
    add: (notif: NotificationParam[] | NotificationParam) => void;
    event: (id: string, eventName: string, data?: any) => boolean;
    find: (id: string) => Notification;
    remove: (id: string) => boolean;
    options: {
        maxCapacity?: number;
        defaultType?: string;
        defaultTtl?: number;
        sortOrder?: SortOrder;
        defaultIcons?: Record<string, Function> | boolean;
        logger?: (...v: any[]) => void;
    };
    EVENT: {
        CLICK: string;
        CREATE: string;
        REMOVE: string;
        AUTO_DISPOSE: string;
        MOUSEOVER: string;
        MOUSEOUT: string;
    };
    setMaxCapacity: (v: any) => void;
    setSortOrder: (v: any) => void;
};
export {};
