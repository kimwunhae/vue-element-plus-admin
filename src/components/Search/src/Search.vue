<script setup lang="tsx">
import { Form, FormSchema, FormSetProps } from '@/components/Form'
import { PropType, computed, unref, ref, watch, onMounted } from 'vue'
import { propTypes } from '@/utils/propTypes'
import { useForm } from '@/hooks/web/useForm'
import { findIndex } from '@/utils'
import { cloneDeep, set } from 'lodash-es'
import { initModel } from '@/components/Form/src/helper'
import ActionButton from './components/ActionButton.vue'
import { SearchProps } from './types'
import { FormItemProp } from 'element-plus'
import { isObject, isEmptyVal } from '@/utils/is'

const props = defineProps({
  // The layout structure array of FORM
  schema: {
    type: Array as PropType<FormSchema[]>,
    default: () => []
  },
  // Do you need a grid layout
  isCol: propTypes.bool.def(false),
  // Form label width
  labelWidth: propTypes.oneOfType([String, Number]).def('auto'),
  // Operation button style location
  layout: propTypes.string.validate((v: string) => ['inline', 'bottom'].includes(v)).def('inline'),
  // Alignment of the bottom button
  buttonPosition: propTypes.string
    .validate((v: string) => ['left', 'center', 'right'].includes(v))
    .def('center'),
  showSearch: propTypes.bool.def(true),
  showReset: propTypes.bool.def(true),
  // Whether to show telescopic
  showExpand: propTypes.bool.def(false),
  // The boundary field of telescopic
  expandField: propTypes.string.def(''),
  inline: propTypes.bool.def(true),
  // Whether to remove the empty value
  removeNoValueItem: propTypes.bool.def(true),
  model: {
    type: Object as PropType<Recordable>,
    default: () => ({})
  },
  searchLoading: propTypes.bool.def(false),
  resetLoading: propTypes.bool.def(false)
})

const emit = defineEmits(['search', 'reset', 'register', 'validate'])

const visible = ref(true)

// Form data
const formModel = ref<Recordable>(props.model)

const newSchema = computed(() => {
  const propsComputed = unref(getProps)
  let schema: FormSchema[] = cloneDeep(propsComputed.schema)
  if (propsComputed.showExpand && propsComputed.expandField && !unref(visible)) {
    const index = findIndex(schema, (v: FormSchema) => v.field === propsComputed.expandField)
    schema.map((v, i) => {
      if (i >= index) {
        v.hidden = true
      } else {
        v.hidden = false
      }
      return v
    })
  }
  if (propsComputed.layout === 'inline') {
    schema = schema.concat([
      {
        field: 'action',
        formItemProps: {
          labelWidth: '0px',
          slots: {
            default: () => {
              return (
                <div>
                  <ActionButton
                    showSearch={propsComputed.showSearch}
                    showReset={propsComputed.showReset}
                    showExpand={propsComputed.showExpand}
                    searchLoading={propsComputed.searchLoading}
                    resetLoading={propsComputed.resetLoading}
                    visible={visible.value}
                    onExpand={setVisible}
                    onReset={reset}
                    onSearch={search}
                  />
                </div>
              )
            },
            label: () => {
              return <span>&nbsp;</span>
            }
          }
        }
      }
    ])
  }
  return schema
})

const { formRegister, formMethods } = useForm()
const { getElFormExpose, getFormData, getFormExpose } = formMethods

// PROPS introduced in usesearch
const outsideProps = ref<SearchProps>({})

const mergeProps = ref<SearchProps>({})

const getProps = computed(() => {
  const propsObj = { ...props }
  Object.assign(propsObj, unref(mergeProps))
  return propsObj
})

const setProps = (props: SearchProps = {}) => {
  mergeProps.value = Object.assign(unref(mergeProps), props)
  // @ts-ignore
  outsideProps.value = props
}

const schemaRef = ref<FormSchema[]>([])

// Structural array of listening forms, re -generate formmodel
watch(
  () => unref(newSchema),
  async (schema = []) => {
    formModel.value = initModel(schema, unref(formModel))
    schemaRef.value = schema
  },
  {
    immediate: true,
    deep: true
  }
)

const filterModel = async () => {
  const model = await getFormData()
  if (unref(getProps).removeNoValueItem) {
    // Use Reduce to filter the empty value and return a new object
    return Object.keys(model).reduce((prev, next) => {
      const value = model[next]
      if (!isEmptyVal(value)) {
        if (isObject(value)) {
          if (Object.keys(value).length > 0) {
            prev[next] = value
          }
        } else {
          prev[next] = value
        }
      }
      return prev
    }, {})
  }
  return model
}

const search = async () => {
  const elFormExpose = await getElFormExpose()
  await elFormExpose?.validate(async (isValid) => {
    if (isValid) {
      const model = await filterModel()
      emit('search', model)
    }
  })
}

const reset = async () => {
  const elFormExpose = await getElFormExpose()
  elFormExpose?.resetFields()
  const model = await filterModel()
  emit('reset', model)
}

const bottomButtonStyle = computed(() => {
  return {
    textAlign: unref(getProps).buttonPosition as unknown as 'left' | 'center' | 'right'
  }
})

const setVisible = async () => {
  visible.value = !unref(visible)
}

const setSchema = (schemaProps: FormSetProps[]) => {
  const { schema } = unref(getProps)
  for (const v of schema) {
    for (const item of schemaProps) {
      if (v.field === item.field) {
        set(v, item.path, item.value)
      }
    }
  }
}

// Assign to the form
const setValues = async (data: Recordable = {}) => {
  formModel.value = Object.assign(props.model, unref(formModel), data)
  const formExpose = await getFormExpose()
  formExpose?.setValues(data)
}

const delSchema = (field: string) => {
  const { schema } = unref(getProps)

  const index = findIndex(schema, (v: FormSchema) => v.field === field)
  if (index > -1) {
    schema.splice(index, 1)
  }
}

const addSchema = (formSchema: FormSchema, index?: number) => {
  const { schema } = unref(getProps)
  if (index !== void 0) {
    schema.splice(index, 0, formSchema)
    return
  }
  schema.push(formSchema)
}

const defaultExpose = {
  getElFormExpose,
  setProps,
  setSchema,
  setValues,
  delSchema,
  addSchema,
  getFormData
}

onMounted(() => {
  emit('register', defaultExpose)
})

defineExpose(defaultExpose)

const onFormValidate = (prop: FormItemProp, isValid: boolean, message: string) => {
  emit('validate', prop, isValid, message)
}
</script>

<template>
  <Form
    :model="formModel"
    :is-custom="false"
    :label-width="getProps.labelWidth"
    hide-required-asterisk
    :inline="getProps.inline"
    :is-col="getProps.isCol"
    :schema="schemaRef"
    @register="formRegister"
    @validate="onFormValidate"
  />

  <template v-if="layout === 'bottom'">
    <div :style="bottomButtonStyle">
      <ActionButton
        :show-reset="getProps.showReset"
        :show-search="getProps.showSearch"
        :show-expand="getProps.showExpand"
        :search-loading="getProps.searchLoading"
        :reset-loading="getProps.resetLoading"
        @expand="setVisible"
        @reset="reset"
        @search="search"
      />
    </div>
  </template>
</template>
