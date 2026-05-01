import { message } from 'antd'

const toastProxy = Object.assign(
    (msg) => message.info(msg),
    message
)

export const useToast = () => {
    return {
        toasts: [],
        toast: toastProxy,
        removeToast: () => {}
    }
}
