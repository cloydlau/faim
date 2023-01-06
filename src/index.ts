// import type { Plugin } from 'vue-demi'
import KiFormDialog from './FormDialog.vue'
import KiPopButton from './PopButton.vue'
import KiPopSwitch from './PopSwitch.vue'
import KiSelect from './Select.vue'

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
  KiPopButton,
  KiPopSwitch,
  KiSelect,
}
