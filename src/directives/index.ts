import type { App } from 'vue'
import { setupPermissionDirective } from './permission/hasPermi'

/**
 * Export instruction: v-xxx
 * @methods Haspermi button permissions, usage: v-haspermi
 */
export const setupPermission = (app: App<Element>) => {
  setupPermissionDirective(app)
}
