<script setup lang="ts">
import type { Driver } from '#shared/types/drivers/schema'
import { UBadge } from '#components'
import { h, resolveComponent } from 'vue'
import DeleteConfirmation from '~/components/Confirmation/DeleteConfirmation.vue'
import DriverModal from '~/components/Drivers/DriverModal.vue'
import { useDrivers } from '~/composables/database/useDrivers'
import { errorNotification, successfulNotification } from '~/utils/notifications/toast'


definePageMeta({
    layout: 'default',
})

const UButton = resolveComponent('UButton')

const { drivers, driversError, driversPending, deleteDriver } = useDrivers()

type DriverRow = Driver & { createdAtLabel: string }

const deletingId = ref<string | null>(null)

const deleteConfirmOpen = ref(false)
const driverPendingDelete = ref<DriverRow | null>(null)

const modalOpen = ref(false)
const modalDriver = ref<Driver | null>(null)

const rows = computed<DriverRow[]>(() => {
    const list: Driver[] = drivers.value ?? []
    return list.map((driver: Driver) => ({
        ...driver,
        createdAtLabel:
            driver.createdAt instanceof Date
                ? driver.createdAt.toLocaleDateString('pl-PL')
                : '—',
    }))
})


function openCreate(): void {
    modalDriver.value = null
    modalOpen.value = true
}


function openEdit(row: DriverRow): void {
    modalDriver.value = {
        id: row.id,
        name: row.name,
        phoneNumber: row.phoneNumber,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    }
    modalOpen.value = true
}


function requestDelete(row: DriverRow): void {
    driverPendingDelete.value = row
    deleteConfirmOpen.value = true
}


async function confirmDelete(): Promise<void> {
    const row = driverPendingDelete.value
    const id = row?.id
    if (!id) {
        return
    }

    deletingId.value = id
    const result = await deleteDriver(id)
    deletingId.value = null

    if (result.success) {
        successfulNotification('Kierowca został usunięty')
        deleteConfirmOpen.value = false
    } else {
        console.error(result.error)
        errorNotification('Nie udało się usunąć kierowcy', result.error)
    }
}


watch(deleteConfirmOpen, (isOpen) => {
    if (!isOpen) {
        driverPendingDelete.value = null
    }
})


const columns = computed(() => {
    void deletingId.value

    return [
        {
            accessorKey: 'name',
            header: 'Nazwa',
            cell: ({ row }: { row: { original: DriverRow } }) =>
                h(
                    UBadge,
                    {
                        color: 'neutral',
                        variant: 'subtle',
                        size: 'md',
                    },
                    () => row.original.name,
                ),
        },
        { accessorKey: 'phoneNumber', header: 'Telefon' },
        { accessorKey: 'createdAtLabel', header: 'Utworzono' },
        {
            id: 'actions',
            accessorKey: 'actions',
            header: 'Akcje',
            cell: ({ row }: { row: { original: DriverRow } }) =>
                h(
                    'div',
                    { class: 'flex items-center gap-1' },
                    [
                        h(UButton, {
                            color: 'neutral',
                            variant: 'ghost',
                            square: true,
                            icon: 'i-heroicons-pencil',
                            'aria-label': 'Edytuj kierowcę',
                            onClick: () => openEdit(row.original),
                        }),
                        h(UButton, {
                            color: 'error',
                            variant: 'ghost',
                            square: true,
                            icon: 'i-heroicons-trash',
                            loading: deletingId.value === row.original.id,
                            disabled: deletingId.value !== null && deletingId.value !== row.original.id,
                            'aria-label': 'Usuń kierowcę',
                            onClick: () => requestDelete(row.original),
                        }),
                    ],
                ),
        },
    ]
})
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-8">
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-xl font-semibold text-highlighted">
        Kierowcy
      </h1>
      <UButton
        icon="i-heroicons-plus"
        color="primary"
        @click="openCreate"
      >
        Dodaj kierowcę
      </UButton>
    </div>

    <DriverModal
      v-model:open="modalOpen"
      :driver="modalDriver"
    />

    <DeleteConfirmation
      v-model:open="deleteConfirmOpen"
      title="Potwierdź usunięcie"
      description="Tej operacji nie można cofnąć."
      :pending="deletingId !== null"
      @confirm="confirmDelete"
    />

    <UAlert
      v-if="driversError"
      color="error"
      variant="soft"
      title="Nie udało się wczytać listy kierowców"
      :description="String(driversError)"
      class="mb-4"
      icon="i-heroicons-exclamation-circle"
    />

    <UTable
      :data="rows"
      :columns="columns"
      :loading="driversPending"
      :get-row-id="(row: DriverRow) => row.id ?? ''"
      empty="Brak kierowców w bazie."
      class="w-full"
    />
  </div>
</template>
