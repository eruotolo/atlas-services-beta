export const AR_SEED = {
    country: {
        code: 'ar',
        name: 'Argentina',
        currency: 'ARS',
        locale: 'es-AR',
        timezone: 'America/Argentina/Buenos_Aires',
        gateway: 'MERCADOPAGO' as const,
        regionLabel: 'Provincia',
        localityLabel: 'Localidad',
    },
    regions: [
        {
            name: 'Buenos Aires',
            code: 'BA',
            localities: [
                { name: 'La Plata', slug: 'la-plata' },
                { name: 'Mar del Plata', slug: 'mar-del-plata' },
                { name: 'Bahía Blanca', slug: 'bahia-blanca' },
                { name: 'Quilmes', slug: 'quilmes' },
                { name: 'Lanús', slug: 'lanus' },
                { name: 'Tandil', slug: 'tandil' },
                { name: 'Junín', slug: 'junin-ba' },
                { name: 'Morón', slug: 'moron' },
            ],
        },
        {
            name: 'Ciudad de Buenos Aires',
            code: 'CABA',
            localities: [
                { name: 'Buenos Aires', slug: 'buenos-aires' },
                { name: 'Palermo', slug: 'palermo' },
                { name: 'Recoleta', slug: 'recoleta' },
                { name: 'Caballito', slug: 'caballito' },
            ],
        },
        {
            name: 'Catamarca',
            code: 'CA',
            localities: [
                { name: 'San Fernando del Valle de Catamarca', slug: 'catamarca-capital' },
            ],
        },
        {
            name: 'Chaco',
            code: 'CH',
            localities: [
                { name: 'Resistencia', slug: 'resistencia' },
                { name: 'Barranqueras', slug: 'barranqueras' },
                { name: 'Presidencia Roque Sáenz Peña', slug: 'saenz-pena' },
            ],
        },
        {
            name: 'Chubut',
            code: 'CU',
            localities: [
                { name: 'Rawson', slug: 'rawson' },
                { name: 'Comodoro Rivadavia', slug: 'comodoro-rivadavia' },
                { name: 'Trelew', slug: 'trelew' },
                { name: 'Puerto Madryn', slug: 'puerto-madryn' },
            ],
        },
        {
            name: 'Córdoba',
            code: 'CB',
            localities: [
                { name: 'Córdoba', slug: 'cordoba-cb' },
                { name: 'Villa María', slug: 'villa-maria' },
                { name: 'Río Cuarto', slug: 'rio-cuarto' },
                { name: 'Villa Carlos Paz', slug: 'villa-carlos-paz' },
            ],
        },
        {
            name: 'Corrientes',
            code: 'CN',
            localities: [
                { name: 'Corrientes', slug: 'corrientes-cn' },
                { name: 'Goya', slug: 'goya' },
                { name: 'Mercedes', slug: 'mercedes-cn' },
            ],
        },
        {
            name: 'Entre Ríos',
            code: 'ER',
            localities: [
                { name: 'Paraná', slug: 'parana' },
                { name: 'Concordia', slug: 'concordia' },
                { name: 'Gualeguaychú', slug: 'gualeguaychu' },
            ],
        },
        {
            name: 'Formosa',
            code: 'FO',
            localities: [
                { name: 'Formosa', slug: 'formosa' },
                { name: 'Clorinda', slug: 'clorinda' },
            ],
        },
        {
            name: 'Jujuy',
            code: 'JU',
            localities: [
                { name: 'San Salvador de Jujuy', slug: 'jujuy-capital' },
                { name: 'Palpalá', slug: 'palpala' },
                { name: 'Humahuaca', slug: 'humahuaca' },
            ],
        },
        {
            name: 'La Pampa',
            code: 'LP',
            localities: [
                { name: 'Santa Rosa', slug: 'santa-rosa-lp' },
                { name: 'General Pico', slug: 'general-pico' },
            ],
        },
        {
            name: 'La Rioja',
            code: 'LR',
            localities: [
                { name: 'La Rioja', slug: 'la-rioja-lr' },
                { name: 'Chilecito', slug: 'chilecito' },
            ],
        },
        {
            name: 'Mendoza',
            code: 'MZ',
            localities: [
                { name: 'Mendoza', slug: 'mendoza' },
                { name: 'San Rafael', slug: 'san-rafael' },
                { name: 'Godoy Cruz', slug: 'godoy-cruz' },
                { name: 'Luján de Cuyo', slug: 'lujan-de-cuyo' },
            ],
        },
        {
            name: 'Misiones',
            code: 'MI',
            localities: [
                { name: 'Posadas', slug: 'posadas' },
                { name: 'Oberá', slug: 'obera' },
                { name: 'Puerto Iguazú', slug: 'puerto-iguazu' },
            ],
        },
        {
            name: 'Neuquén',
            code: 'NQ',
            localities: [
                { name: 'Neuquén', slug: 'neuquen' },
                { name: 'San Martín de los Andes', slug: 'san-martin-de-los-andes' },
                { name: 'Villa la Angostura', slug: 'villa-la-angostura' },
            ],
        },
        {
            name: 'Río Negro',
            code: 'RN',
            localities: [
                { name: 'Viedma', slug: 'viedma' },
                { name: 'Bariloche', slug: 'bariloche' },
                { name: 'Cipolletti', slug: 'cipolletti' },
                { name: 'El Bolsón', slug: 'el-bolson' },
            ],
        },
        {
            name: 'Salta',
            code: 'SA',
            localities: [
                { name: 'Salta', slug: 'salta' },
                { name: 'Tartagal', slug: 'tartagal' },
                { name: 'Cafayate', slug: 'cafayate' },
            ],
        },
        {
            name: 'San Juan',
            code: 'SJ',
            localities: [
                { name: 'San Juan', slug: 'san-juan-sj' },
                { name: 'Rivadavia', slug: 'rivadavia-sj' },
            ],
        },
        {
            name: 'San Luis',
            code: 'SL',
            localities: [
                { name: 'San Luis', slug: 'san-luis-sl' },
                { name: 'Villa Mercedes', slug: 'villa-mercedes' },
            ],
        },
        {
            name: 'Santa Cruz',
            code: 'SC',
            localities: [
                { name: 'Río Gallegos', slug: 'rio-gallegos' },
                { name: 'El Calafate', slug: 'el-calafate' },
            ],
        },
        {
            name: 'Santa Fe',
            code: 'SF',
            localities: [
                { name: 'Santa Fe', slug: 'santa-fe-sf' },
                { name: 'Rosario', slug: 'rosario' },
                { name: 'Rafaela', slug: 'rafaela' },
                { name: 'Venado Tuerto', slug: 'venado-tuerto' },
            ],
        },
        {
            name: 'Santiago del Estero',
            code: 'SE',
            localities: [
                { name: 'Santiago del Estero', slug: 'santiago-del-estero' },
                { name: 'La Banda', slug: 'la-banda' },
            ],
        },
        {
            name: 'Tierra del Fuego',
            code: 'TF',
            localities: [
                { name: 'Ushuaia', slug: 'ushuaia' },
                { name: 'Río Grande', slug: 'rio-grande-tf' },
            ],
        },
        {
            name: 'Tucumán',
            code: 'TU',
            localities: [
                { name: 'San Miguel de Tucumán', slug: 'tucuman-capital' },
                { name: 'Tafí Viejo', slug: 'tafi-viejo' },
                { name: 'Yerba Buena', slug: 'yerba-buena' },
            ],
        },
    ],
};
