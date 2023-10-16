import type { ComponentPublicInstance } from 'vue-demi';
export declare function getListeners(this: ComponentPublicInstance, globalListeners: Record<string, any>): any;
export declare function isGlobalSlot(slot: any): any;
export declare function isEmpty(value: any): boolean;
export declare function notEmpty(value: any): boolean;
export declare function isObject(value: any): boolean;
export declare function tryParsingJSONArray(str: any): false | any[];
export declare function isBase64WithScheme(str: string, mediaType?: string): boolean;
export declare function unwrap(value: any, srcAt: string | ((value: any) => unknown) | symbol): any;
