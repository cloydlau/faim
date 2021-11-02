import 'uno.css'

import UnivariateTable from './components/UnivariateTable'
import CountdownButton from './components/CountdownButton'
import CheckAllBox from './components/CheckAllBox'
import FormDialog from './components/FormDialog'
import PopButton from './components/PopButton'
import PopSwitch from './components/PopSwitch'
import Select from './components/Select'
import Webcam from './components/Webcam'
import Swal from './components/Swal'

const components = [
  UnivariateTable,
  CountdownButton,
  CheckAllBox,
  FormDialog,
  PopButton,
  PopSwitch,
  Select,
  Webcam,
]

const install = function (Vue, opts = {}) {
  components.forEach(component => {
    Vue.component(component.name, component)
  })

  Vue.prototype.$Swal = Swal
}

export default {
  install,
  ...components,
}

export {
  UnivariateTable,
  CountdownButton,
  CheckAllBox,
  FormDialog,
  PopButton,
  PopSwitch,
  Select,
  Webcam,
  Swal,
}
