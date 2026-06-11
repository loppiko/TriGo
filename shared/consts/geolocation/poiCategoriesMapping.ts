import { TomSearchResultType, TomLocationCategoryCodeEnum } from "../../types/models/location/search/enum"


export const POI_CATEGORY_MAPPING: Record<TomLocationCategoryCodeEnum, { icon: string; description: string }> = {
    [TomLocationCategoryCodeEnum.ACCESS_GATEWAY]: {
        icon: 'i-heroicons-arrow-right-on-rectangle',
        description: 'Przejście dostępu',
    },
    [TomLocationCategoryCodeEnum.ADMINISTRATIVE_DIVISION]: {
        icon: 'i-heroicons-map',
        description: 'Jednostka administracyjna',
    },
    [TomLocationCategoryCodeEnum.ADVENTURE_SPORTS_VENUE]: {
        icon: 'i-heroicons-sparkles',
        description: 'Sporty przygodowe',
    },
    [TomLocationCategoryCodeEnum.AGRICULTURE]: {
        icon: 'i-heroicons-truck',
        description: 'Rolnictwo',
    },
    [TomLocationCategoryCodeEnum.AIRPORT]: {
        icon: 'i-heroicons-paper-airplane',
        description: 'Lotnisko',
    },
    [TomLocationCategoryCodeEnum.AMUSEMENT_PARK]: {
        icon: 'i-heroicons-face-smile',
        description: 'Park rozrywki',
    },
    [TomLocationCategoryCodeEnum.AUTOMOTIVE_DEALER]: {
        icon: 'i-heroicons-truck',
        description: 'Salon samochodowy',
    },
    [TomLocationCategoryCodeEnum.BANK]: {
        icon: 'i-heroicons-building-library',
        description: 'Bank',
    },
    [TomLocationCategoryCodeEnum.BEACH]: {
        icon: 'i-heroicons-sun',
        description: 'Plaża',
    },
    [TomLocationCategoryCodeEnum.BUILDING_POINT]: {
        icon: 'i-heroicons-building-office-2',
        description: 'Budynek (punkt adresowy)',
    },
    [TomLocationCategoryCodeEnum.BUSINESS_PARK]: {
        icon: 'i-heroicons-building-office',
        description: 'Park biznesowy',
    },
    [TomLocationCategoryCodeEnum.CAFE_PUB]: {
        icon: 'i-heroicons-cup-hot',
        description: 'Kawiarnia i pub',
    },
    [TomLocationCategoryCodeEnum.CAMPING_GROUND]: {
        icon: 'i-heroicons-home-modern',
        description: 'Kemping',
    },
    [TomLocationCategoryCodeEnum.CAR_WASH]: {
        icon: 'i-heroicons-sparkles',
        description: 'Myjnia',
    },
    [TomLocationCategoryCodeEnum.CASH_DISPENSER]: {
        icon: 'i-heroicons-banknotes',
        description: 'Bankomat',
    },
    [TomLocationCategoryCodeEnum.CASINO]: {
        icon: 'i-heroicons-squares-2x2',
        description: 'Kasyno',
    },
    [TomLocationCategoryCodeEnum.CINEMA]: {
        icon: 'i-heroicons-film',
        description: 'Kino',
    },
    [TomLocationCategoryCodeEnum.CITY_CENTER]: {
        icon: 'i-heroicons-building-office-2',
        description: 'Centrum miasta',
    },
    [TomLocationCategoryCodeEnum.CLUB_ASSOCIATION]: {
        icon: 'i-heroicons-user-group',
        description: 'Klub / stowarzyszenie',
    },
    [TomLocationCategoryCodeEnum.COLLEGE_UNIVERSITY]: {
        icon: 'i-heroicons-academic-cap',
        description: 'Uczelnia',
    },
    [TomLocationCategoryCodeEnum.COMMERCIAL_BUILDING]: {
        icon: 'i-heroicons-building-office',
        description: 'Budynek komercyjny',
    },
    [TomLocationCategoryCodeEnum.COMMUNITY_CENTER]: {
        icon: 'i-heroicons-user-group',
        description: 'Dom kultury / centrum społeczności',
    },
    [TomLocationCategoryCodeEnum.COMPANY]: {
        icon: 'i-heroicons-building-office-2',
        description: 'Firma',
    },
    [TomLocationCategoryCodeEnum.COURTHOUSE]: {
        icon: 'i-heroicons-scale',
        description: 'Sąd',
    },
    [TomLocationCategoryCodeEnum.CULTURAL_CENTER]: {
        icon: 'i-heroicons-building-library',
        description: 'Centrum kultury',
    },
    [TomLocationCategoryCodeEnum.DENTIST]: {
        icon: 'i-heroicons-face-smile',
        description: 'Dentysta',
    },
    [TomLocationCategoryCodeEnum.DEPARTMENT_STORE]: {
        icon: 'i-heroicons-shopping-bag',
        description: 'Dom towarowy',
    },
    [TomLocationCategoryCodeEnum.DOCTOR]: {
        icon: 'i-heroicons-heart',
        description: 'Lekarz',
    },
    [TomLocationCategoryCodeEnum.ELECTRIC_VEHICLE_STATION]: {
        icon: 'i-heroicons-bolt',
        description: 'Ładowarka pojazdów elektrycznych',
    },
    [TomLocationCategoryCodeEnum.EMBASSY]: {
        icon: 'i-heroicons-flag',
        description: 'Ambasada',
    },
    [TomLocationCategoryCodeEnum.EMERGENCY_MEDICAL_SERVICE]: {
        icon: 'i-heroicons-truck',
        description: 'Pogotowie ratunkowe',
    },
    [TomLocationCategoryCodeEnum.ENTERTAINMENT]: {
        icon: 'i-heroicons-musical-note',
        description: 'Rozrywka',
    },
    [TomLocationCategoryCodeEnum.EXCHANGE]: {
        icon: 'i-heroicons-currency-dollar',
        description: 'Kantor / giełda',
    },
    [TomLocationCategoryCodeEnum.EXHIBITION_CONVENTION_CENTER]: {
        icon: 'i-heroicons-building-office-2',
        description: 'Centrum targowo-kongresowe',
    },
    [TomLocationCategoryCodeEnum.FERRY_TERMINAL]: {
        icon: 'i-heroicons-globe-americas',
        description: 'Terminal promowy',
    },
    [TomLocationCategoryCodeEnum.FIRE_STATION_BRIGADE]: {
        icon: 'i-heroicons-fire',
        description: 'Straż pożarna',
    },
    [TomLocationCategoryCodeEnum.FRONTIER_CROSSING]: {
        icon: 'i-heroicons-map',
        description: 'Przejście graniczne',
    },
    [TomLocationCategoryCodeEnum.FUEL_FACILITIES]: {
        icon: 'i-heroicons-fire',
        description: 'Infrastruktura paliwowa',
    },
    [TomLocationCategoryCodeEnum.GEOGRAPHIC_FEATURE]: {
        icon: 'i-heroicons-globe-alt',
        description: 'Obiekt geograficzny',
    },
    [TomLocationCategoryCodeEnum.GOLF_COURSE]: {
        icon: 'i-heroicons-flag',
        description: 'Pole golfowe',
    },
    [TomLocationCategoryCodeEnum.GOVERNMENT_OFFICE]: {
        icon: 'i-heroicons-building-library',
        description: 'Urząd',
    },
    [TomLocationCategoryCodeEnum.HEALTH_CARE_SERVICE]: {
        icon: 'i-heroicons-heart',
        description: 'Opieka zdrowotna',
    },
    [TomLocationCategoryCodeEnum.HELIPAD_HELICOPTER_LANDING]: {
        icon: 'i-heroicons-paper-airplane',
        description: 'Lądowisko dla helikopterów',
    },
    [TomLocationCategoryCodeEnum.HOLIDAY_RENTAL]: {
        icon: 'i-heroicons-home',
        description: 'Nocleg wakacyjny',
    },
    [TomLocationCategoryCodeEnum.HOSPITAL_POLYCLINIC]: {
        icon: 'i-heroicons-heart',
        description: 'Szpital / przychodnia',
    },
    [TomLocationCategoryCodeEnum.HOTEL_MOTEL]: {
        icon: 'i-heroicons-home-modern',
        description: 'Hotel / motel',
    },
    [TomLocationCategoryCodeEnum.ICE_SKATING_RINK]: {
        icon: 'i-heroicons-arrow-path',
        description: 'Lodowisko',
    },
    [TomLocationCategoryCodeEnum.IMPORTANT_TOURIST_ATTRACTION]: {
        icon: 'i-heroicons-map-pin',
        description: 'Ważna atrakcja turystyczna',
    },
    [TomLocationCategoryCodeEnum.INDUSTRIAL_BUILDING]: {
        icon: 'i-heroicons-building-storefront',
        description: 'Zakład przemysłowy',
    },
    [TomLocationCategoryCodeEnum.LEISURE_CENTER]: {
        icon: 'i-heroicons-sparkles',
        description: 'Centrum rekreacji',
    },
    [TomLocationCategoryCodeEnum.LIBRARY]: {
        icon: 'i-heroicons-book-open',
        description: 'Biblioteka',
    },
    [TomLocationCategoryCodeEnum.MANUFACTURING_FACILITY]: {
        icon: 'i-heroicons-cog-6-tooth',
        description: 'Zakład produkcyjny',
    },
    [TomLocationCategoryCodeEnum.MARINA]: {
        icon: 'i-heroicons-map',
        description: 'Marina jachtowa',
    },
    [TomLocationCategoryCodeEnum.MARKET]: {
        icon: 'i-heroicons-shopping-cart',
        description: 'Targ / rynek',
    },
    [TomLocationCategoryCodeEnum.MEDIA_FACILITY]: {
        icon: 'i-heroicons-megaphone',
        description: 'Media',
    },
    [TomLocationCategoryCodeEnum.MILITARY_INSTALLATION]: {
        icon: 'i-heroicons-shield-check',
        description: 'Obiekt wojskowy',
    },
    [TomLocationCategoryCodeEnum.MOTORING_ORGANIZATION_OFFICE]: {
        icon: 'i-heroicons-wrench-screwdriver',
        description: 'Biuro motoryzacyjne',
    },
    [TomLocationCategoryCodeEnum.MOUNTAIN_PASS]: {
        icon: 'i-heroicons-arrow-trending-up',
        description: 'Przełęcz',
    },
    [TomLocationCategoryCodeEnum.MUSEUM]: {
        icon: 'i-heroicons-building-library',
        description: 'Muzeum',
    },
    [TomLocationCategoryCodeEnum.NATIVE_RESERVATION]: {
        icon: 'i-heroicons-map',
        description: 'Terytorium rdzennych mieszkańców',
    },
    [TomLocationCategoryCodeEnum.NIGHTLIFE]: {
        icon: 'i-heroicons-moon',
        description: 'Życie nocne',
    },
    [TomLocationCategoryCodeEnum.NON_GOVERNMENTAL_ORGANIZATION]: {
        icon: 'i-heroicons-hand-raised',
        description: 'Organizacja pozarządowa',
    },
    [TomLocationCategoryCodeEnum.OPEN_PARKING_AREA]: {
        icon: 'i-heroicons-square-3-stack-3d',
        description: 'Parking otwarty',
    },
    [TomLocationCategoryCodeEnum.OTHER]: {
        icon: 'i-heroicons-question-mark-circle',
        description: 'Inne',
    },
    [TomLocationCategoryCodeEnum.PARKING_GARAGE]: {
        icon: 'i-heroicons-building-office-2',
        description: 'Parking wielopoziomowy',
    },
    [TomLocationCategoryCodeEnum.PARK_RECREATION_AREA]: {
        icon: 'i-heroicons-sparkles',
        description: 'Park i rekreacja',
    },
    [TomLocationCategoryCodeEnum.PETROL_STATION]: {
        icon: 'i-heroicons-fire',
        description: 'Stacja paliw',
    },
    [TomLocationCategoryCodeEnum.PHARMACY]: {
        icon: 'i-heroicons-plus-circle',
        description: 'Apteka',
    },
    [TomLocationCategoryCodeEnum.PLACE_OF_WORSHIP]: {
        icon: 'i-heroicons-building-library',
        description: 'Miejsce kultu',
    },
    [TomLocationCategoryCodeEnum.POLICE_STATION]: {
        icon: 'i-heroicons-shield-check',
        description: 'Policja',
    },
    [TomLocationCategoryCodeEnum.PORT_WAREHOUSE_FACILITY]: {
        icon: 'i-heroicons-building-office',
        description: 'Port / magazyn',
    },
    [TomLocationCategoryCodeEnum.POST_OFFICE]: {
        icon: 'i-heroicons-envelope',
        description: 'Poczta',
    },
    [TomLocationCategoryCodeEnum.PRIMARY_RESOURCE_UTILITY]: {
        icon: 'i-heroicons-bolt',
        description: 'Sieć energetyczna / media',
    },
    [TomLocationCategoryCodeEnum.PRISON_CORRECTIONAL_FACILITY]: {
        icon: 'i-heroicons-lock-closed',
        description: 'Zakład karny',
    },
    [TomLocationCategoryCodeEnum.PUBLIC_AMENITY]: {
        icon: 'i-heroicons-building-storefront',
        description: 'Udogodnienie publiczne',
    },
    [TomLocationCategoryCodeEnum.PUBLIC_TRANSPORT_STOP]: {
        icon: 'i-heroicons-map-pin',
        description: 'Przystanek komunikacji',
    },
    [TomLocationCategoryCodeEnum.RAILWAY_STATION]: {
        icon: 'i-heroicons-truck',
        description: 'Stacja kolejowa',
    },
    [TomLocationCategoryCodeEnum.RENT_A_CAR_FACILITY]: {
        icon: 'i-heroicons-truck',
        description: 'Wypożyczalnia aut',
    },
    [TomLocationCategoryCodeEnum.RENT_A_CAR_PARKING]: {
        icon: 'i-heroicons-square-3-stack-3d',
        description: 'Parking wypożyczalni',
    },
    [TomLocationCategoryCodeEnum.REPAIR_FACILITY]: {
        icon: 'i-heroicons-wrench-screwdriver',
        description: 'Warsztat',
    },
    [TomLocationCategoryCodeEnum.RESEARCH_FACILITY]: {
        icon: 'i-heroicons-beaker',
        description: 'Ośrodek badawczy',
    },
    [TomLocationCategoryCodeEnum.RESIDENTIAL_ACCOMMODATION]: {
        icon: 'i-heroicons-home',
        description: 'Zabudowa mieszkaniowa',
    },
    [TomLocationCategoryCodeEnum.RESTAURANT]: {
        icon: 'i-heroicons-building-storefront',
        description: 'Restauracja',
    },
    [TomLocationCategoryCodeEnum.RESTAURANT_AREA]: {
        icon: 'i-heroicons-building-storefront',
        description: 'Strefa gastronomiczna',
    },
    [TomLocationCategoryCodeEnum.REST_AREA]: {
        icon: 'i-heroicons-map-pin',
        description: 'Miejsce odpoczynku',
    },
    [TomLocationCategoryCodeEnum.SCENIC_PANORAMIC_VIEW]: {
        icon: 'i-heroicons-eye',
        description: 'Punkt widokowy',
    },
    [TomLocationCategoryCodeEnum.SCHOOL]: {
        icon: 'i-heroicons-academic-cap',
        description: 'Szkoła',
    },
    [TomLocationCategoryCodeEnum.SHOP]: {
        icon: 'i-heroicons-shopping-bag',
        description: 'Sklep',
    },
    [TomLocationCategoryCodeEnum.SHOPPING_CENTER]: {
        icon: 'i-heroicons-shopping-cart',
        description: 'Centrum handlowe',
    },
    [TomLocationCategoryCodeEnum.SPORTS_CENTER]: {
        icon: 'i-heroicons-trophy',
        description: 'Centrum sportu',
    },
    [TomLocationCategoryCodeEnum.STADIUM]: {
        icon: 'i-heroicons-trophy',
        description: 'Stadion',
    },
    [TomLocationCategoryCodeEnum.SWIMMING_POOL]: {
        icon: 'i-heroicons-sparkles',
        description: 'Basen',
    },
    [TomLocationCategoryCodeEnum.TENNIS_COURT]: {
        icon: 'i-heroicons-trophy',
        description: 'Kort tenisowy',
    },
    [TomLocationCategoryCodeEnum.THEATER]: {
        icon: 'i-heroicons-ticket',
        description: 'Teatr',
    },
    [TomLocationCategoryCodeEnum.TOURIST_INFORMATION_OFFICE]: {
        icon: 'i-heroicons-information-circle',
        description: 'Informacja turystyczna',
    },
    [TomLocationCategoryCodeEnum.TRAFFIC_LIGHT]: {
        icon: 'i-heroicons-signal',
        description: 'Sygnalizacja świetlna',
    },
    [TomLocationCategoryCodeEnum.TRAFFIC_SERVICE_CENTER]: {
        icon: 'i-heroicons-wrench-screwdriver',
        description: 'Punkt obsługi ruchu',
    },
    [TomLocationCategoryCodeEnum.TRAFFIC_SIGN]: {
        icon: 'i-heroicons-exclamation-triangle',
        description: 'Znak drogowy',
    },
    [TomLocationCategoryCodeEnum.TRAIL_SYSTEM]: {
        icon: 'i-heroicons-map',
        description: 'Szlak turystyczny',
    },
    [TomLocationCategoryCodeEnum.TRANSPORT_AUTHORITY_VEHICLE_REGISTRATION]: {
        icon: 'i-heroicons-clipboard-document-check',
        description: 'Rejestracja pojazdów',
    },
    [TomLocationCategoryCodeEnum.TRUCK_STOP]: {
        icon: 'i-heroicons-truck',
        description: 'Postój dla ciężarówek',
    },
    [TomLocationCategoryCodeEnum.VETERINARIAN]: {
        icon: 'i-heroicons-heart',
        description: 'Weterynarz',
    },
    [TomLocationCategoryCodeEnum.WATER_SPORT]: {
        icon: 'i-heroicons-globe-americas',
        description: 'Sporty wodne',
    },
    [TomLocationCategoryCodeEnum.WEIGH_STATION]: {
        icon: 'i-heroicons-scale',
        description: 'Waga drogowa',
    },
    [TomLocationCategoryCodeEnum.WELFARE_ORGANIZATION]: {
        icon: 'i-heroicons-heart',
        description: 'Organizacja charytatywna',
    },
    [TomLocationCategoryCodeEnum.WINERY]: {
        icon: 'i-heroicons-beaker',
        description: 'Winnica',
    },
    [TomLocationCategoryCodeEnum.ZOOS_ARBORETA_BOTANICAL_GARDEN]: {
        icon: 'i-heroicons-face-smile',
        description: 'Zoo / ogród botaniczny',
    },
}


export const DEFAULT_LOCATION_CATEGORIES = {
    [TomSearchResultType.POI]: {
        'icon': 'i-heroicons-map-pin',
        'description': 'Lokalizacja',
    },
    [TomSearchResultType.STREET]: {
        'icon': 'i-heroicons-map',
        'description': 'Ulica',
    },
    [TomSearchResultType.POINT_ADDRESS]: {
        'icon': 'i-heroicons-map-pin',
        'description': 'Dokładny adres',
    },
}
