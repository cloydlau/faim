import Swal from 'sweetalert2';
import type { SweetAlertOptions } from 'sweetalert2';
declare function success(options: string | SweetAlertOptions): Promise<import("sweetalert2").SweetAlertResult<any>> | undefined;
declare function info(options: string | SweetAlertOptions): Promise<import("sweetalert2").SweetAlertResult<any>> | undefined;
declare function warning(options: string | SweetAlertOptions): Promise<import("sweetalert2").SweetAlertResult<any>> | undefined;
declare function error(options: string | SweetAlertOptions): Promise<import("sweetalert2").SweetAlertResult<any>> | undefined;
declare function confirm(options: string | SweetAlertOptions): Promise<unknown> | undefined;
declare const _default: typeof Swal & {
    success: typeof success;
    warning: typeof warning;
    info: typeof info;
    error: typeof error;
    confirm: typeof confirm;
};
export default _default;
