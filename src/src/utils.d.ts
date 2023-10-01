import type { ComponentPublicInstance } from 'vue-demi';
export declare function getListeners(this: ComponentPublicInstance, globalListeners: Record<string, any>): any;
export declare function isGlobalSlot(slot: any): any;
export declare function isEmpty(value: any): boolean;
export declare function notEmpty(value: any): boolean;
export declare function isObject(value: any): boolean;
export declare function unwrap<V = any>(value: V, path?: string | ((value: V) => any) | symbol): any;
export declare function wrap(value: any, url: string): any;
