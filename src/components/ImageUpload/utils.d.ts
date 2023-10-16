export declare const MB: number;
export declare const KB = 1024;
export declare function equalOrWithin(value: any): boolean;
export declare function sizeToText(size: number): string;
export declare function getOrigin(url: string): string;
export declare function fileToBlob(file: File | Blob): Promise<unknown>;
export declare function binaryToArrayBuffer(file: File | Blob): Promise<unknown>;
export declare function blobToFile(blob: File | Blob, fileName?: string, fileType?: string): File;
export declare function binaryToBase64(binary: File | Blob): Promise<unknown>;
export declare function toBinary(source: File | Blob | string): Promise<Blob>;
export declare function toLocalURL(source: File | Blob | string): Promise<unknown>;
export declare function toImageTag(src: string): Promise<unknown>;