declare const _default: import("vue-demi").DefineComponent<{
    [x: string]: StringConstructor | {
        type: BooleanConstructor;
        default: undefined;
    } | {
        type?: undefined;
        default?: undefined;
    };
    disabled: {
        type: BooleanConstructor;
        default: undefined;
    };
    outputFormat: {};
}, {
    id: import("vue-demi").Ref<string>;
    loading: import("vue-demi").Ref<boolean>;
}, unknown, {}, {}, import("vue-demi").ComponentOptionsMixin, import("vue-demi").ComponentOptionsMixin, string[], string, import("vue-demi").VNodeProps & import("vue-demi").AllowedComponentProps & import("vue-demi").ComponentCustomProps, Readonly<import("vue-demi").ExtractPropTypes<{
    [x: string]: StringConstructor | {
        type: BooleanConstructor;
        default: undefined;
    } | {
        type?: undefined;
        default?: undefined;
    };
    disabled: {
        type: BooleanConstructor;
        default: undefined;
    };
    outputFormat: {};
}>> & {
    [x: `on${Capitalize<string>}`]: ((...args: any[]) => any) | undefined;
}, {}, {}>;
export default _default;
