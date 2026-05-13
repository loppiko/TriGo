import { PickupTypeEnum } from "#shared/types/reservations/enums";

export const pickupTypeOptions = [
    {
        value: PickupTypeEnum.MEET_AND_GREET,
        title: 'Meet & Greet',
        description: 'Kierowca wyjdzie po Ciebie z tabliczką i pomoże z bagażem',
        icon: 'i-lucide-handshake',
    },
    {
        value: PickupTypeEnum.STANDARD,
        title: 'Standard Pickup',
        description: 'Kierowca będzie czekał w samochodzie pod wskazanym adresem',
        icon: 'i-lucide-car',
    },
]

