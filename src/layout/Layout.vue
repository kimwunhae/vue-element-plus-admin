<script lang="tsx">
import { computed, defineComponent, unref } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { Backtop } from '@/components/Backtop'
import { Setting } from '@/components/Setting'
import { useRenderLayout } from './components/useRenderLayout'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('layout')

const appStore = useAppStore()

// Whether it is the mobile terminal
const mobile = computed(() => appStore.getMobile)

// Menu folding
const collapse = computed(() => appStore.getCollapse)

const layout = computed(() => appStore.getLayout)

const handleClickOutside = () => {
  appStore.setCollapse(true)
}

const renderLayout = () => {
  switch (unref(layout)) {
    case 'classic':
      const { renderClassic } = useRenderLayout()
      return renderClassic()
    case 'topLeft':
      const { renderTopLeft } = useRenderLayout()
      return renderTopLeft()
    case 'top':
      const { renderTop } = useRenderLayout()
      return renderTop()
    case 'cutMenu':
      const { renderCutMenu } = useRenderLayout()
      return renderCutMenu()
    default:
      break
  }
}

export default defineComponent({
  name: 'Layout',
  setup() {
    return () => (
      <section class={[prefixCls, `${prefixCls}__${layout.value}`, 'w-[100%] h-[100%] relative']}>
        {mobile.value && !collapse.value ? (
          <div
            class="absolute top-0 left-0 w-full h-full opacity-30 z-99 bg-[var(--el-color-black)]"
            onClick={handleClickOutside}
          ></div>
        ) : undefined}

        {renderLayout()}

        <Backtop></Backtop>

        <Setting></Setting>
      </section>
    )
  }
})
</script>

<style lang="less" scoped>
@prefix-cls: ~'@{namespace}-layout';

.@{prefix-cls} {
  background-color: var(--app-content-bg-color);
  .@{prefix-cls}-content-scrollbar {
    & > :deep(.el-scrollbar__wrap) {
      & > .@{elNamespace}-scrollbar__view {
        display: flex;
        height: 100% !important;
        flex-direction: column;
      }
    }
  }
}
</style>
