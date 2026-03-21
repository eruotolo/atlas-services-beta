export const ES_SEED = {
    country: {
        code: 'es',
        name: 'España',
        currency: 'EUR',
        locale: 'es-ES',
        timezone: 'Europe/Madrid',
        gateway: 'STRIPE' as const,
        regionLabel: 'Comunidad Autónoma',
        localityLabel: 'Municipio',
    },
    regions: [
        {
            name: 'Andalucía',
            code: 'AN',
            localities: [
                { name: 'Sevilla', slug: 'sevilla' },
                { name: 'Málaga', slug: 'malaga' },
                { name: 'Córdoba', slug: 'cordoba-es' },
                { name: 'Granada', slug: 'granada' },
                { name: 'Almería', slug: 'almeria' },
                { name: 'Jaén', slug: 'jaen' },
                { name: 'Cádiz', slug: 'cadiz' },
                { name: 'Huelva', slug: 'huelva' },
                { name: 'Marbella', slug: 'marbella' },
                { name: 'Jerez de la Frontera', slug: 'jerez' },
            ],
        },
        {
            name: 'Aragón',
            code: 'AR',
            localities: [
                { name: 'Zaragoza', slug: 'zaragoza' },
                { name: 'Huesca', slug: 'huesca' },
                { name: 'Teruel', slug: 'teruel' },
            ],
        },
        {
            name: 'Asturias',
            code: 'AS',
            localities: [
                { name: 'Oviedo', slug: 'oviedo' },
                { name: 'Gijón', slug: 'gijon' },
                { name: 'Avilés', slug: 'aviles' },
            ],
        },
        {
            name: 'Islas Baleares',
            code: 'IB',
            localities: [
                { name: 'Palma', slug: 'palma' },
                { name: 'Ibiza', slug: 'ibiza' },
                { name: 'Mahón', slug: 'mahon' },
            ],
        },
        {
            name: 'Canarias',
            code: 'CN',
            localities: [
                { name: 'Las Palmas de Gran Canaria', slug: 'las-palmas' },
                { name: 'Santa Cruz de Tenerife', slug: 'santa-cruz-tenerife' },
                { name: 'Arona', slug: 'arona' },
            ],
        },
        {
            name: 'Cantabria',
            code: 'CB',
            localities: [
                { name: 'Santander', slug: 'santander' },
                { name: 'Torrelavega', slug: 'torrelavega' },
            ],
        },
        {
            name: 'Castilla-La Mancha',
            code: 'CM',
            localities: [
                { name: 'Toledo', slug: 'toledo' },
                { name: 'Albacete', slug: 'albacete' },
                { name: 'Ciudad Real', slug: 'ciudad-real' },
                { name: 'Cuenca', slug: 'cuenca' },
                { name: 'Guadalajara', slug: 'guadalajara-es' },
            ],
        },
        {
            name: 'Castilla y León',
            code: 'CL',
            localities: [
                { name: 'Valladolid', slug: 'valladolid' },
                { name: 'Salamanca', slug: 'salamanca' },
                { name: 'Burgos', slug: 'burgos' },
                { name: 'León', slug: 'leon' },
                { name: 'Ávila', slug: 'avila' },
                { name: 'Segovia', slug: 'segovia' },
            ],
        },
        {
            name: 'Cataluña',
            code: 'CT',
            localities: [
                { name: 'Barcelona', slug: 'barcelona' },
                { name: 'Tarragona', slug: 'tarragona' },
                { name: 'Girona', slug: 'girona' },
                { name: 'Lleida', slug: 'lleida' },
                { name: 'Hospitalet de Llobregat', slug: 'hospitalet' },
                { name: 'Terrassa', slug: 'terrassa' },
                { name: 'Badalona', slug: 'badalona' },
            ],
        },
        {
            name: 'Comunidad Valenciana',
            code: 'VC',
            localities: [
                { name: 'Valencia', slug: 'valencia' },
                { name: 'Alicante', slug: 'alicante' },
                { name: 'Castellón', slug: 'castellon' },
                { name: 'Elche', slug: 'elche' },
                { name: 'Torrevieja', slug: 'torrevieja' },
            ],
        },
        {
            name: 'Extremadura',
            code: 'EX',
            localities: [
                { name: 'Badajoz', slug: 'badajoz' },
                { name: 'Cáceres', slug: 'caceres' },
                { name: 'Mérida', slug: 'merida' },
            ],
        },
        {
            name: 'Galicia',
            code: 'GA',
            localities: [
                { name: 'Vigo', slug: 'vigo' },
                { name: 'A Coruña', slug: 'a-coruna' },
                { name: 'Santiago de Compostela', slug: 'santiago-de-compostela' },
                { name: 'Pontevedra', slug: 'pontevedra' },
                { name: 'Lugo', slug: 'lugo' },
                { name: 'Ourense', slug: 'ourense' },
            ],
        },
        {
            name: 'La Rioja',
            code: 'RI',
            localities: [
                { name: 'Logroño', slug: 'logrono' },
                { name: 'Calahorra', slug: 'calahorra' },
            ],
        },
        {
            name: 'Comunidad de Madrid',
            code: 'MD',
            localities: [
                { name: 'Madrid', slug: 'madrid' },
                { name: 'Alcalá de Henares', slug: 'alcala-de-henares' },
                { name: 'Getafe', slug: 'getafe' },
                { name: 'Móstoles', slug: 'mostoles' },
                { name: 'Alcorcón', slug: 'alcorcon' },
                { name: 'Leganés', slug: 'leganes' },
                { name: 'Fuenlabrada', slug: 'fuenlabrada' },
            ],
        },
        {
            name: 'Región de Murcia',
            code: 'MC',
            localities: [
                { name: 'Murcia', slug: 'murcia' },
                { name: 'Cartagena', slug: 'cartagena-es' },
                { name: 'Lorca', slug: 'lorca' },
            ],
        },
        {
            name: 'Navarra',
            code: 'NC',
            localities: [
                { name: 'Pamplona', slug: 'pamplona' },
                { name: 'Tudela', slug: 'tudela' },
            ],
        },
        {
            name: 'País Vasco',
            code: 'PV',
            localities: [
                { name: 'Bilbao', slug: 'bilbao' },
                { name: 'San Sebastián', slug: 'san-sebastian' },
                { name: 'Vitoria-Gasteiz', slug: 'vitoria' },
                { name: 'Barakaldo', slug: 'barakaldo' },
            ],
        },
    ],
};
