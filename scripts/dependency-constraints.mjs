export const dependencyConstraints = {
  // v2 改为 Web Components 架构，现有图片编辑器依赖的 v1 API 已不兼容，迁移成本和回归风险较高
  cropperjs: '^1',
  // v14 的浏览器基线高于项目当前声明支持的 Safari 14、iOS 12 等版本
  swiper: '^12',
  // v7 起开源许可证改为 GPL-2.0-or-later
  tinymce: '^6',
  // 当前最新版 unbuild 仍将 TypeScript peer 依赖限定为 ^5.9.2
  typescript: '^5',
}
