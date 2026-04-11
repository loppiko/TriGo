import { FuzzySearchResultType, LocationCategoryCodeEnum } from "~/types/locationSearch/enum"


export const POI_CATEGORY_MAPPING: Record<LocationCategoryCodeEnum, { icon: string; description: string }> = {
    [LocationCategoryCodeEnum.ACCESS_GATEWAY]: {
        icon: 'i-heroicons-arrow-right-on-rectangle',
        description: 'Przejście dostępu',
    },
    [LocationCategoryCodeEnum.ADMINISTRATIVE_DIVISION]: {
        icon: 'i-heroicons-map',
        description: 'Jednostka administracyjna',
    },
    [LocationCategoryCodeEnum.ADVENTURE_SPORTS_VENUE]: {
        icon: 'i-heroicons-sparkles',
        description: 'Sporty przygodowe',
    },
    [LocationCategoryCodeEnum.AGRICULTURE]: {
        icon: 'i-heroicons-truck',
        description: 'Rolnictwo',
    },
    [LocationCategoryCodeEnum.AIRPORT]: {
        icon: 'i-heroicons-paper-airplane',
        description: 'Lotnisko',
    },
    [LocationCategoryCodeEnum.AMUSEMENT_PARK]: {
        icon: 'i-heroicons-face-smile',
        description: 'Park rozrywki',
    },
    [LocationCategoryCodeEnum.AUTOMOTIVE_DEALER]: {
        icon: 'i-heroicons-truck',
        description: 'Salon samochodowy',
    },
    [LocationCategoryCodeEnum.BANK]: {
        icon: 'i-heroicons-building-library',
        description: 'Bank',
    },
    [LocationCategoryCodeEnum.BEACH]: {
        icon: 'i-heroicons-sun',
        description: 'Plaża',
    },
    [LocationCategoryCodeEnum.BUILDING_POINT]: {
        icon: 'i-heroicons-building-office-2',
        description: 'Budynek (punkt adresowy)',
    },
    [LocationCategoryCodeEnum.BUSINESS_PARK]: {
        icon: 'i-heroicons-building-office',
        description: 'Park biznesowy',
    },
    [LocationCategoryCodeEnum.CAFE_PUB]: {
        icon: 'i-heroicons-cup-hot',
        description: 'Kawiarnia i pub',
    },
    [LocationCategoryCodeEnum.CAMPING_GROUND]: {
        icon: 'i-heroicons-home-modern',
        description: 'Kemping',
    },
    [LocationCategoryCodeEnum.CAR_WASH]: {
        icon: 'i-heroicons-sparkles',
        description: 'Myjnia',
    },
    [LocationCategoryCodeEnum.CASH_DISPENSER]: {
        icon: 'i-heroicons-banknotes',
        description: 'Bankomat',
    },
    [LocationCategoryCodeEnum.CASINO]: {
        icon: 'i-heroicons-squares-2x2',
        description: 'Kasyno',
    },
    [LocationCategoryCodeEnum.CINEMA]: {
        icon: 'i-heroicons-film',
        description: 'Kino',
    },
    [LocationCategoryCodeEnum.CITY_CENTER]: {
        icon: 'i-heroicons-building-office-2',
        description: 'Centrum miasta',
    },
    [LocationCategoryCodeEnum.CLUB_ASSOCIATION]: {
        icon: 'i-heroicons-user-group',
        description: 'Klub / stowarzyszenie',
    },
    [LocationCategoryCodeEnum.COLLEGE_UNIVERSITY]: {
        icon: 'i-heroicons-academic-cap',
        description: 'Uczelnia',
    },
    [LocationCategoryCodeEnum.COMMERCIAL_BUILDING]: {
        icon: 'i-heroicons-building-office',
        description: 'Budynek komercyjny',
    },
    [LocationCategoryCodeEnum.COMMUNITY_CENTER]: {
        icon: 'i-heroicons-user-group',
        description: 'Dom kultury / centrum społeczności',
    },
    [LocationCategoryCodeEnum.COMPANY]: {
        icon: 'i-heroicons-building-office-2',
        description: 'Firma',
    },
    [LocationCategoryCodeEnum.COURTHOUSE]: {
        icon: 'i-heroicons-scale',
        description: 'Sąd',
    },
    [LocationCategoryCodeEnum.CULTURAL_CENTER]: {
        icon: 'i-heroicons-building-library',
        description: 'Centrum kultury',
    },
    [LocationCategoryCodeEnum.DENTIST]: {
        icon: 'i-heroicons-face-smile',
        description: 'Dentysta',
    },
    [LocationCategoryCodeEnum.DEPARTMENT_STORE]: {
        icon: 'i-heroicons-shopping-bag',
        description: 'Dom towarowy',
    },
    [LocationCategoryCodeEnum.DOCTOR]: {
        icon: 'i-heroicons-heart',
        description: 'Lekarz',
    },
    [LocationCategoryCodeEnum.ELECTRIC_VEHICLE_STATION]: {
        icon: 'i-heroicons-bolt',
        description: 'Ładowarka pojazdów elektrycznych',
    },
    [LocationCategoryCodeEnum.EMBASSY]: {
        icon: 'i-heroicons-flag',
        description: 'Ambasada',
    },
    [LocationCategoryCodeEnum.EMERGENCY_MEDICAL_SERVICE]: {
        icon: 'i-heroicons-truck',
        description: 'Pogotowie ratunkowe',
    },
    [LocationCategoryCodeEnum.ENTERTAINMENT]: {
        icon: 'i-heroicons-musical-note',
        description: 'Rozrywka',
    },
    [LocationCategoryCodeEnum.EXCHANGE]: {
        icon: 'i-heroicons-currency-dollar',
        description: 'Kantor / giełda',
    },
    [LocationCategoryCodeEnum.EXHIBITION_CONVENTION_CENTER]: {
        icon: 'i-heroicons-building-office-2',
        description: 'Centrum targowo-kongresowe',
    },
    [LocationCategoryCodeEnum.FERRY_TERMINAL]: {
        icon: 'i-heroicons-globe-americas',
        description: 'Terminal promowy',
    },
    [LocationCategoryCodeEnum.FIRE_STATION_BRIGADE]: {
        icon: 'i-heroicons-fire',
        description: 'Straż pożarna',
    },
    [LocationCategoryCodeEnum.FRONTIER_CROSSING]: {
        icon: 'i-heroicons-map',
        description: 'Przejście graniczne',
    },
    [LocationCategoryCodeEnum.FUEL_FACILITIES]: {
        icon: 'i-heroicons-fire',
        description: 'Infrastruktura paliwowa',
    },
    [LocationCategoryCodeEnum.GEOGRAPHIC_FEATURE]: {
        icon: 'i-heroicons-globe-alt',
        description: 'Obiekt geograficzny',
    },
    [LocationCategoryCodeEnum.GOLF_COURSE]: {
        icon: 'i-heroicons-flag',
        description: 'Pole golfowe',
    },
    [LocationCategoryCodeEnum.GOVERNMENT_OFFICE]: {
        icon: 'i-heroicons-building-library',
        description: 'Urząd',
    },
    [LocationCategoryCodeEnum.HEALTH_CARE_SERVICE]: {
        icon: 'i-heroicons-heart',
        description: 'Opieka zdrowotna',
    },
    [LocationCategoryCodeEnum.HELIPAD_HELICOPTER_LANDING]: {
        icon: 'i-heroicons-paper-airplane',
        description: 'Lądowisko dla helikopterów',
    },
    [LocationCategoryCodeEnum.HOLIDAY_RENTAL]: {
        icon: 'i-heroicons-home',
        description: 'Nocleg wakacyjny',
    },
    [LocationCategoryCodeEnum.HOSPITAL_POLYCLINIC]: {
        icon: 'i-heroicons-heart',
        description: 'Szpital / przychodnia',
    },
    [LocationCategoryCodeEnum.HOTEL_MOTEL]: {
        icon: 'i-heroicons-home-modern',
        description: 'Hotel / motel',
    },
    [LocationCategoryCodeEnum.ICE_SKATING_RINK]: {
        icon: 'i-heroicons-arrow-path',
        description: 'Lodowisko',
    },
    [LocationCategoryCodeEnum.IMPORTANT_TOURIST_ATTRACTION]: {
        icon: 'i-heroicons-map-pin',
        description: 'Ważna atrakcja turystyczna',
    },
    [LocationCategoryCodeEnum.INDUSTRIAL_BUILDING]: {
        icon: 'i-heroicons-building-storefront',
        description: 'Zakład przemysłowy',
    },
    [LocationCategoryCodeEnum.LEISURE_CENTER]: {
        icon: 'i-heroicons-sparkles',
        description: 'Centrum rekreacji',
    },
    [LocationCategoryCodeEnum.LIBRARY]: {
        icon: 'i-heroicons-book-open',
        description: 'Biblioteka',
    },
    [LocationCategoryCodeEnum.MANUFACTURING_FACILITY]: {
        icon: 'i-heroicons-cog-6-tooth',
        description: 'Zakład produkcyjny',
    },
    [LocationCategoryCodeEnum.MARINA]: {
        icon: 'i-heroicons-map',
        description: 'Marina jachtowa',
    },
    [LocationCategoryCodeEnum.MARKET]: {
        icon: 'i-heroicons-shopping-cart',
        description: 'Targ / rynek',
    },
    [LocationCategoryCodeEnum.MEDIA_FACILITY]: {
        icon: 'i-heroicons-megaphone',
        description: 'Media',
    },
    [LocationCategoryCodeEnum.MILITARY_INSTALLATION]: {
        icon: 'i-heroicons-shield-check',
        description: 'Obiekt wojskowy',
    },
    [LocationCategoryCodeEnum.MOTORING_ORGANIZATION_OFFICE]: {
        icon: 'i-heroicons-wrench-screwdriver',
        description: 'Biuro motoryzacyjne',
    },
    [LocationCategoryCodeEnum.MOUNTAIN_PASS]: {
        icon: 'i-heroicons-arrow-trending-up',
        description: 'Przełęcz',
    },
    [LocationCategoryCodeEnum.MUSEUM]: {
        icon: 'i-heroicons-building-library',
        description: 'Muzeum',
    },
    [LocationCategoryCodeEnum.NATIVE_RESERVATION]: {
        icon: 'i-heroicons-map',
        description: 'Terytorium rdzennych mieszkańców',
    },
    [LocationCategoryCodeEnum.NIGHTLIFE]: {
        icon: 'i-heroicons-moon',
        description: 'Życie nocne',
    },
    [LocationCategoryCodeEnum.NON_GOVERNMENTAL_ORGANIZATION]: {
        icon: 'i-heroicons-hand-raised',
        description: 'Organizacja pozarządowa',
    },
    [LocationCategoryCodeEnum.OPEN_PARKING_AREA]: {
        icon: 'i-heroicons-square-3-stack-3d',
        description: 'Parking otwarty',
    },
    [LocationCategoryCodeEnum.OTHER]: {
        icon: 'i-heroicons-question-mark-circle',
        description: 'Inne',
    },
    [LocationCategoryCodeEnum.PARKING_GARAGE]: {
        icon: 'i-heroicons-building-office-2',
        description: 'Parking wielopoziomowy',
    },
    [LocationCategoryCodeEnum.PARK_RECREATION_AREA]: {
        icon: 'i-heroicons-sparkles',
        description: 'Park i rekreacja',
    },
    [LocationCategoryCodeEnum.PETROL_STATION]: {
        icon: 'i-heroicons-fire',
        description: 'Stacja paliw',
    },
    [LocationCategoryCodeEnum.PHARMACY]: {
        icon: 'i-heroicons-plus-circle',
        description: 'Apteka',
    },
    [LocationCategoryCodeEnum.PLACE_OF_WORSHIP]: {
        icon: 'i-heroicons-building-library',
        description: 'Miejsce kultu',
    },
    [LocationCategoryCodeEnum.POLICE_STATION]: {
        icon: 'i-heroicons-shield-check',
        description: 'Policja',
    },
    [LocationCategoryCodeEnum.PORT_WAREHOUSE_FACILITY]: {
        icon: 'i-heroicons-building-office',
        description: 'Port / magazyn',
    },
    [LocationCategoryCodeEnum.POST_OFFICE]: {
        icon: 'i-heroicons-envelope',
        description: 'Poczta',
    },
    [LocationCategoryCodeEnum.PRIMARY_RESOURCE_UTILITY]: {
        icon: 'i-heroicons-bolt',
        description: 'Sieć energetyczna / media',
    },
    [LocationCategoryCodeEnum.PRISON_CORRECTIONAL_FACILITY]: {
        icon: 'i-heroicons-lock-closed',
        description: 'Zakład karny',
    },
    [LocationCategoryCodeEnum.PUBLIC_AMENITY]: {
        icon: 'i-heroicons-building-storefront',
        description: 'Udogodnienie publiczne',
    },
    [LocationCategoryCodeEnum.PUBLIC_TRANSPORT_STOP]: {
        icon: 'i-heroicons-map-pin',
        description: 'Przystanek komunikacji',
    },
    [LocationCategoryCodeEnum.RAILWAY_STATION]: {
        icon: 'i-heroicons-truck',
        description: 'Stacja kolejowa',
    },
    [LocationCategoryCodeEnum.RENT_A_CAR_FACILITY]: {
        icon: 'i-heroicons-truck',
        description: 'Wypożyczalnia aut',
    },
    [LocationCategoryCodeEnum.RENT_A_CAR_PARKING]: {
        icon: 'i-heroicons-square-3-stack-3d',
        description: 'Parking wypożyczalni',
    },
    [LocationCategoryCodeEnum.REPAIR_FACILITY]: {
        icon: 'i-heroicons-wrench-screwdriver',
        description: 'Warsztat',
    },
    [LocationCategoryCodeEnum.RESEARCH_FACILITY]: {
        icon: 'i-heroicons-beaker',
        description: 'Ośrodek badawczy',
    },
    [LocationCategoryCodeEnum.RESIDENTIAL_ACCOMMODATION]: {
        icon: 'i-heroicons-home',
        description: 'Zabudowa mieszkaniowa',
    },
    [LocationCategoryCodeEnum.RESTAURANT]: {
        icon: 'i-heroicons-building-storefront',
        description: 'Restauracja',
    },
    [LocationCategoryCodeEnum.RESTAURANT_AREA]: {
        icon: 'i-heroicons-building-storefront',
        description: 'Strefa gastronomiczna',
    },
    [LocationCategoryCodeEnum.REST_AREA]: {
        icon: 'i-heroicons-map-pin',
        description: 'Miejsce odpoczynku',
    },
    [LocationCategoryCodeEnum.SCENIC_PANORAMIC_VIEW]: {
        icon: 'i-heroicons-eye',
        description: 'Punkt widokowy',
    },
    [LocationCategoryCodeEnum.SCHOOL]: {
        icon: 'i-heroicons-academic-cap',
        description: 'Szkoła',
    },
    [LocationCategoryCodeEnum.SHOP]: {
        icon: 'i-heroicons-shopping-bag',
        description: 'Sklep',
    },
    [LocationCategoryCodeEnum.SHOPPING_CENTER]: {
        icon: 'i-heroicons-shopping-cart',
        description: 'Centrum handlowe',
    },
    [LocationCategoryCodeEnum.SPORTS_CENTER]: {
        icon: 'i-heroicons-trophy',
        description: 'Centrum sportu',
    },
    [LocationCategoryCodeEnum.STADIUM]: {
        icon: 'i-heroicons-trophy',
        description: 'Stadion',
    },
    [LocationCategoryCodeEnum.SWIMMING_POOL]: {
        icon: 'i-heroicons-sparkles',
        description: 'Basen',
    },
    [LocationCategoryCodeEnum.TENNIS_COURT]: {
        icon: 'i-heroicons-trophy',
        description: 'Kort tenisowy',
    },
    [LocationCategoryCodeEnum.THEATER]: {
        icon: 'i-heroicons-ticket',
        description: 'Teatr',
    },
    [LocationCategoryCodeEnum.TOURIST_INFORMATION_OFFICE]: {
        icon: 'i-heroicons-information-circle',
        description: 'Informacja turystyczna',
    },
    [LocationCategoryCodeEnum.TRAFFIC_LIGHT]: {
        icon: 'i-heroicons-signal',
        description: 'Sygnalizacja świetlna',
    },
    [LocationCategoryCodeEnum.TRAFFIC_SERVICE_CENTER]: {
        icon: 'i-heroicons-wrench-screwdriver',
        description: 'Punkt obsługi ruchu',
    },
    [LocationCategoryCodeEnum.TRAFFIC_SIGN]: {
        icon: 'i-heroicons-exclamation-triangle',
        description: 'Znak drogowy',
    },
    [LocationCategoryCodeEnum.TRAIL_SYSTEM]: {
        icon: 'i-heroicons-map',
        description: 'Szlak turystyczny',
    },
    [LocationCategoryCodeEnum.TRANSPORT_AUTHORITY_VEHICLE_REGISTRATION]: {
        icon: 'i-heroicons-clipboard-document-check',
        description: 'Rejestracja pojazdów',
    },
    [LocationCategoryCodeEnum.TRUCK_STOP]: {
        icon: 'i-heroicons-truck',
        description: 'Postój dla ciężarówek',
    },
    [LocationCategoryCodeEnum.VETERINARIAN]: {
        icon: 'i-heroicons-heart',
        description: 'Weterynarz',
    },
    [LocationCategoryCodeEnum.WATER_SPORT]: {
        icon: 'i-heroicons-globe-americas',
        description: 'Sporty wodne',
    },
    [LocationCategoryCodeEnum.WEIGH_STATION]: {
        icon: 'i-heroicons-scale',
        description: 'Waga drogowa',
    },
    [LocationCategoryCodeEnum.WELFARE_ORGANIZATION]: {
        icon: 'i-heroicons-heart',
        description: 'Organizacja charytatywna',
    },
    [LocationCategoryCodeEnum.WINERY]: {
        icon: 'i-heroicons-beaker',
        description: 'Winnica',
    },
    [LocationCategoryCodeEnum.ZOOS_ARBORETA_BOTANICAL_GARDEN]: {
        icon: 'i-heroicons-face-smile',
        description: 'Zoo / ogród botaniczny',
    },
}


export const DEFAULT_LOCATION_CATEGORIES = {
    [FuzzySearchResultType.POI]: {
        'icon': 'i-heroicons-map-pin',
        'description': 'Lokalizacja',
    },
    [FuzzySearchResultType.STREET]: {
        'icon': 'i-heroicons-map',
        'description': 'Ulica',
    },
    [FuzzySearchResultType.POINT_ADDRESS]: {
        'icon': 'i-heroicons-map-pin',
        'description': 'Dokładny adres',
    },
}
