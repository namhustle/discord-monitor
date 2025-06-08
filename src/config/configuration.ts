import { readFileSync } from 'fs'
import * as yaml from 'js-yaml'
import { join } from 'path'

const YAML_CONFIG_FILENAME = 'servers.yaml'

export default () => {
  return {
    servers: yaml.load(
      readFileSync(join(process.cwd(), YAML_CONFIG_FILENAME), 'utf8'),
    ),
  }
}
