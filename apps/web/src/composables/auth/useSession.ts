import { useStorage } from '@vueuse/core'
import { computed } from 'vue'


export function useSessionStorage() {
    const deviceId = useStorage(
        'session_device_id',
        () => crypto.randomUUID(),
        localStorage,
        {
            mergeDefaults: true,
            serializer: {
                read: (v: string) => v,
                write: (v: string) => v
            }
        }
    )

    const isNewDevice = computed(() => {
        return !localStorage.getItem('session_device_init_timestamp')
    })


    const markAsInitialized = () => {
        if (isNewDevice.value) {
            localStorage.setItem('session_device_init_timestamp', new Date().toISOString())
        }
    }

    return {
        deviceId,
        isNewDevice,
        markAsInitialized
    }
}