import type { DefineComponent } from 'vue'
declare module '*.vue' {
  type SFC = DefineComponent<{}, {}, any>
  export default SFC
}
declare module '*.css'
