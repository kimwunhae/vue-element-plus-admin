import { ref, unref, nextTick } from 'vue'
import { FormSchema, FormSetProps } from '@/components/Form'
import { SearchExpose, SearchProps } from '@/components/Search'

export const useSearch = () => {
  // Search instance
  const searchRef = ref<SearchExpose>()

  /**
   * @param ref Search instance
   * @param elRef Elform instance
   */
  const register = (ref: SearchExpose) => {
    searchRef.value = ref
  }

  const getSearch = async () => {
    await nextTick()
    const search = unref(searchRef)
    if (!search) {
      console.error('The Search is not registered. Please use the register method to register')
    }
    return search
  }

  // Some built -in methods
  const methods = {
    /**
     * @description Set the PROPS of Search component
     * @param field FormItem's Field
     */
    setProps: async (props: SearchProps = {}) => {
      const search = await getSearch()
      search?.setProps(props)
      if (props.model) {
        search?.setValues(props.model)
      }
    },

    /**
     * @description Set the value of form
     * @param data Data needed to be set
     */
    setValues: async (data: Recordable) => {
      const search = await getSearch()
      search?.setValues(data)
    },

    /**
     * @description Set SCHEMA
     * @param schemaProps SCHEMAPROPS that needs to be set
     */
    setSchema: async (schemaProps: FormSetProps[]) => {
      const search = await getSearch()
      search?.setSchema(schemaProps)
    },

    /**
     * @description New SCHEMA
     * @param formSchema Need to add data
     * @param index Where to add
     */
    addSchema: async (formSchema: FormSchema, index?: number) => {
      const search = await getSearch()
      search?.addSchema(formSchema, index)
    },

    /**
     * @description Delete SCHEMA
     * @param field Which data deletes
     */
    delSchema: async (field: string) => {
      const search = await getSearch()
      search?.delSchema(field)
    },

    /**
     * @description Get the form data
     * @returns form data
     */
    getFormData: async <T = Recordable>(): Promise<T> => {
      const search = await getSearch()
      return search?.getFormData() as T
    }
  }

  return {
    searchRegister: register,
    searchMethods: methods
  }
}
