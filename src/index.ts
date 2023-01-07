// import type { Plugin } from 'vue-demi'
import KiFormDialog from './FormDialog/index.vue'
// import KiImage from './Image/index.vue'
// import KiMap from './Map/index.vue'
import KiPopButton from './PopButton/index.vue'
import KiPopSwitch from './PopSwitch/index.vue'
import KiSelect from './Select/index.vue'
// import KiUpload from './Upload/index.vue'

/* type SFCWithInstall<T> = T & Plugin

declare global {
  interface Window {
    Kikimore: {
      KiFormDialog: SFCWithInstall<KiFormDialog>
      KiPopButton: SFCWithInstall<KiPopButton>
      KiPopSwitch: SFCWithInstall<KiPopSwitch>
      KiSelect: SFCWithInstall<KiSelect>
    }
  }
}

// For CDN usage
if (typeof window !== 'undefined' && window.Vue) {
  window.Kikimore = {
    KiFormDialog,
    KiPopButton,
    KiPopSwitch,
    KiSelect,
  }
} */

export {
  KiFormDialog,
  // KiImage,
  // KiMap,
  KiPopButton,
  KiPopSwitch,
  KiSelect,
  // KiUpload,
}
