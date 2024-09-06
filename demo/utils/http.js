import axios from 'axios'
import createAxiosShortcut from 'axios-shortcut'

const { GET, DELETE, HEAD, OPTIONS, POST, PUT, PATCH, DOWNLOAD } = createAxiosShortcut(axios)

export { DELETE, DOWNLOAD, GET, HEAD, OPTIONS, PATCH, POST, PUT }
