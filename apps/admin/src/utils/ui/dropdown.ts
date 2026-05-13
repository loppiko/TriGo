import type { Reservation } from '#shared/types/reservations/schema'
import type { DropdownMenuItem } from '@nuxt/ui'
import {
    reservationStatusBgClass,
    reservationStatusBgHoverClass,
    reservationStatusIconClass,
    reservationStatusTextClass,
    reservationStatusTextHoverClass,
} from './reservations'


export function createDropdownColoredItem(
    label: string,
    status: Reservation['status'],
    icon: string,
    type: 'checkbox' | 'label' | 'separator' | 'link',
    checked: boolean,
    isFirst: boolean = false,
): DropdownMenuItem {
    return {
        type,
        checked,
        label,
        icon,
        ui: {
            itemLeadingIcon: reservationStatusIconClass(status),
        },
        class: [
            'rounded-md',
            reservationStatusBgClass(status),
            reservationStatusBgHoverClass(status),
            reservationStatusTextClass(status),
            reservationStatusTextHoverClass(status),
            isFirst ? '' : 'mt-1',
        ].join(' '),
    }
}
