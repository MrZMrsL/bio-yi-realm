import { reactive } from 'vue'

const state = reactive({
  visible: false,
  type: 'confirm', // 'confirm' | 'prompt'
  title: '',
  message: '',
  confirmText: '确定',
  cancelText: '取消',
  inputValue: '',
  placeholder: '',
  resolve: null,
})

function close() {
  state.visible = false
  state.resolve = null
  state.inputValue = ''
}

export function useDialog() {
  function confirm(options = {}) {
    return new Promise(resolve => {
      state.type = 'confirm'
      state.title = options.title || '提示'
      state.message = options.message || ''
      state.confirmText = options.confirmText || '确定'
      state.cancelText = options.cancelText || '取消'
      state.inputValue = ''
      state.placeholder = ''
      state.resolve = resolve
      state.visible = true
    })
  }

  function prompt(options = {}) {
    return new Promise(resolve => {
      state.type = 'prompt'
      state.title = options.title || '请输入'
      state.message = options.message || ''
      state.confirmText = options.confirmText || '确定'
      state.cancelText = options.cancelText || '取消'
      state.inputValue = options.defaultValue || ''
      state.placeholder = options.placeholder || ''
      state.resolve = resolve
      state.visible = true
    })
  }

  function onConfirm() {
    if (state.resolve) {
      state.resolve(state.type === 'prompt' ? state.inputValue : true)
    }
    close()
  }

  function onCancel() {
    if (state.resolve) {
      state.resolve(state.type === 'prompt' ? null : false)
    }
    close()
  }

  return {
    state,
    confirm,
    prompt,
    onConfirm,
    onCancel,
    close,
  }
}
