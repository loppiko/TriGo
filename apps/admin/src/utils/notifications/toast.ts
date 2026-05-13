export function successfulNotification(title: string, description?: string) {
    const toast = useToast()
    toast.add({
        title,
        description,
        color: 'success',
        icon: 'i-heroicons-check-circle',
    })
}

export function errorNotification(title: string, description?: string) {
    const toast = useToast()
    toast.add({
        title,
        description,
        color: 'error',
        icon: 'i-heroicons-exclamation-circle',
    })
}

export function infoNotification(title: string, description?: string) {
    const toast = useToast()
    toast.add({
        title,
        description,
        color: 'info',
        icon: 'i-heroicons-information-circle',
    })
}

export function warningNotification(title: string, description?: string) {
    const toast = useToast()
    toast.add({
        title,
        description,
        color: 'warning',
        icon: 'i-heroicons-exclamation-triangle',
    })
}
