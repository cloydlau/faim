export const MB = 1024 ** 2
export const TEN_MB = 10 * MB
export const GB = 1024 ** 3
export const TEN_GB = 10 * GB

// 文件存储 S3 协议的限制，分片数量不能超过 1000 个。
export function getChunkSize(fileSize) {
  return fileSize > TEN_GB ? fileSize / 1000 : TEN_MB
}
