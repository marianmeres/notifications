type stringify = () => string;
type Label = string | Record<string, string> | stringify | object;
type onEventFn = (eventName: string, data: any, self: Notification, all: Notification[]) => void;
interface RenderProps {
    component: Function;
    props?: any;
}
interface Notification extends Record<string, any> {
    id: any;
    type?: string;
    text?: Label;
    html?: Label;
    created?: Date;
    on?: onEventFn;
    render?: RenderProps;
}
type NotificationParam = Notification | string;
interface CreateNotiticationStoreOptions {
    maxCapacity: number;
    defaultType: string;
    logger: (...v: any[]) => void;
}
export declare const createNotificationsStore: (initial?: NotificationParam[], options?: Partial<CreateNotiticationStoreOptions>) => {
    subscribe: (cb: Function) => Function;
    add: (notif: NotificationParam[] | NotificationParam) => void;
    event: (id: string, eventName: string, data?: any) => boolean;
    find: (id: string) => Notification;
    remove: (id: string) => boolean;
    options: {
        maxCapacity?: number;
        defaultType?: string;
        logger?: (...v: any[]) => void;
    };
};
export {};
