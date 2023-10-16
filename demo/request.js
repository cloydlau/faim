import axios from 'axios'
import createAxiosShortcut from 'axios-shortcut'

const { POST, GET } = createAxiosShortcut(axios)
export { POST, GET }
