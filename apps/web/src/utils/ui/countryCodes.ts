export interface CountryCode {
    code: string
    dial: string
    image: string
    countryName: string
}


export const COUNTRY_CODES: CountryCode[] = [
    { code: 'PL', dial: '+48', image: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/pl.svg", countryName: 'Polska' },
    { code: 'DE', dial: '+49', image: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/de.svg", countryName: 'Niemcy' },
    { code: 'GB', dial: '+44', image: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/gb.svg", countryName: 'Wielka Brytania' },
    { code: 'US', dial: '+1',  image: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/us.svg", countryName: 'Stany Zjednoczone' },
    { code: 'FR', dial: '+33', image: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/fr.svg", countryName: 'Francja' },
    { code: 'IT', dial: '+39', image: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/it.svg", countryName: 'Włochy' },
    { code: 'ES', dial: '+34', image: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/es.svg", countryName: 'Hiszpania' },
    { code: 'NL', dial: '+31', image: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/nl.svg", countryName: 'Holandia' },
    { code: 'BE', dial: '+32', image: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/be.svg", countryName: 'Belgia' },
    { code: 'AT', dial: '+43', image: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/at.svg", countryName: 'Austria' },
    { code: 'CH', dial: '+41', image: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/ch.svg", countryName: 'Szwajcaria' },
    { code: 'SE', dial: '+46', image: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/se.svg", countryName: 'Szwecja' },
    { code: 'NO', dial: '+47', image: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/no.svg", countryName: 'Norwegia' },
    { code: 'DK', dial: '+45', image: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/dk.svg", countryName: 'Dania' },
    { code: 'FI', dial: '+358', image: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/fi.svg", countryName: 'Finlandia' },
    { code: 'CZ', dial: '+420', image: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/cz.svg", countryName: 'Czechy' },
    { code: 'SK', dial: '+421', image: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/sk.svg", countryName: 'Słowacja' },
    { code: 'HU', dial: '+36', image: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/hu.svg", countryName: 'Węgry' },
    { code: 'RO', dial: '+40', image: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/ro.svg", countryName: 'Rumunia' },
    { code: 'BG', dial: '+359', image: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/bg.svg", countryName: 'Bułgaria' },
    { code: 'HR', dial: '+385', image: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/hr.svg", countryName: 'Chorwacja' },
    { code: 'UA', dial: '+380', image: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/ua.svg", countryName: 'Ukraina' },
    { code: 'LT', dial: '+370', image: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/lt.svg", countryName: 'Litwa' },
    { code: 'LV', dial: '+371', image: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/lv.svg", countryName: 'Łotwa' },
    { code: 'EE', dial: '+372', image: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/ee.svg", countryName: 'Estonia' },
    { code: 'PT', dial: '+351', image: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/pt.svg", countryName: 'Portugalia' },
    { code: 'GR', dial: '+30', image: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/gr.svg", countryName: 'Grecja' },
    { code: 'IE', dial: '+353', image: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/ie.svg", countryName: 'Irlandia' },
    { code: 'TR', dial: '+90', image: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/tr.svg", countryName: 'Turcja' },
    { code: 'RU', dial: '+7', image: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/ru.svg", countryName: 'Rosja' },
]


export const DEFAULT_COUNTRY_CODE = COUNTRY_CODES.find((c) => c.code === 'PL')!
