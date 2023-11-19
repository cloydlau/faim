import { PascalCasedName, name } from './package.json'

const prefix = PascalCasedName.substring(0, 2)

export default (componentName) => {
  // where `componentName` is always CapitalCase
  if (componentName.startsWith(prefix)) {
    return { name: componentName, from: name }
  }
}
