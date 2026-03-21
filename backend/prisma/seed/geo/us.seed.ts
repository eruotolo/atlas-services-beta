export const US_SEED = {
    country: {
        code: 'us',
        name: 'United States',
        currency: 'USD',
        locale: 'en-US',
        timezone: 'America/New_York',
        gateway: 'STRIPE' as const,
        regionLabel: 'State',
        localityLabel: 'City',
    },
    regions: [
        {
            name: 'Alabama',
            code: 'AL',
            localities: [
                { name: 'Birmingham', slug: 'birmingham-al' },
                { name: 'Montgomery', slug: 'montgomery-al' },
                { name: 'Huntsville', slug: 'huntsville' },
            ],
        },
        {
            name: 'Alaska',
            code: 'AK',
            localities: [
                { name: 'Anchorage', slug: 'anchorage' },
                { name: 'Fairbanks', slug: 'fairbanks' },
            ],
        },
        {
            name: 'Arizona',
            code: 'AZ',
            localities: [
                { name: 'Phoenix', slug: 'phoenix' },
                { name: 'Tucson', slug: 'tucson' },
                { name: 'Mesa', slug: 'mesa-az' },
                { name: 'Scottsdale', slug: 'scottsdale' },
            ],
        },
        {
            name: 'Arkansas',
            code: 'ARK',
            localities: [
                { name: 'Little Rock', slug: 'little-rock' },
                { name: 'Fort Smith', slug: 'fort-smith' },
            ],
        },
        {
            name: 'California',
            code: 'CA',
            localities: [
                { name: 'Los Angeles', slug: 'los-angeles-ca' },
                { name: 'San Francisco', slug: 'san-francisco' },
                { name: 'San Diego', slug: 'san-diego' },
                { name: 'San Jose', slug: 'san-jose-ca' },
                { name: 'Sacramento', slug: 'sacramento' },
                { name: 'Fresno', slug: 'fresno' },
                { name: 'Oakland', slug: 'oakland' },
            ],
        },
        {
            name: 'Colorado',
            code: 'CO_US',
            localities: [
                { name: 'Denver', slug: 'denver' },
                { name: 'Colorado Springs', slug: 'colorado-springs' },
                { name: 'Aurora', slug: 'aurora-co' },
                { name: 'Boulder', slug: 'boulder' },
            ],
        },
        {
            name: 'Connecticut',
            code: 'CT',
            localities: [
                { name: 'Bridgeport', slug: 'bridgeport' },
                { name: 'New Haven', slug: 'new-haven' },
                { name: 'Hartford', slug: 'hartford' },
            ],
        },
        {
            name: 'Delaware',
            code: 'DE',
            localities: [
                { name: 'Wilmington', slug: 'wilmington-de' },
                { name: 'Dover', slug: 'dover' },
            ],
        },
        {
            name: 'District of Columbia',
            code: 'DC',
            localities: [{ name: 'Washington', slug: 'washington-dc' }],
        },
        {
            name: 'Florida',
            code: 'FL',
            localities: [
                { name: 'Miami', slug: 'miami' },
                { name: 'Orlando', slug: 'orlando' },
                { name: 'Tampa', slug: 'tampa' },
                { name: 'Jacksonville', slug: 'jacksonville' },
                { name: 'Fort Lauderdale', slug: 'fort-lauderdale' },
            ],
        },
        {
            name: 'Georgia',
            code: 'GA_US',
            localities: [
                { name: 'Atlanta', slug: 'atlanta' },
                { name: 'Augusta', slug: 'augusta-ga' },
                { name: 'Savannah', slug: 'savannah' },
            ],
        },
        {
            name: 'Hawaii',
            code: 'HI',
            localities: [
                { name: 'Honolulu', slug: 'honolulu' },
                { name: 'Hilo', slug: 'hilo' },
            ],
        },
        {
            name: 'Idaho',
            code: 'ID',
            localities: [
                { name: 'Boise', slug: 'boise' },
                { name: 'Nampa', slug: 'nampa' },
            ],
        },
        {
            name: 'Illinois',
            code: 'IL',
            localities: [
                { name: 'Chicago', slug: 'chicago' },
                { name: 'Aurora', slug: 'aurora-il' },
                { name: 'Rockford', slug: 'rockford' },
            ],
        },
        {
            name: 'Indiana',
            code: 'IN_US',
            localities: [
                { name: 'Indianapolis', slug: 'indianapolis' },
                { name: 'Fort Wayne', slug: 'fort-wayne' },
            ],
        },
        {
            name: 'Iowa',
            code: 'IA',
            localities: [
                { name: 'Des Moines', slug: 'des-moines' },
                { name: 'Cedar Rapids', slug: 'cedar-rapids' },
            ],
        },
        {
            name: 'Kansas',
            code: 'KS',
            localities: [
                { name: 'Wichita', slug: 'wichita' },
                { name: 'Overland Park', slug: 'overland-park' },
            ],
        },
        {
            name: 'Kentucky',
            code: 'KY',
            localities: [
                { name: 'Louisville', slug: 'louisville' },
                { name: 'Lexington', slug: 'lexington' },
            ],
        },
        {
            name: 'Louisiana',
            code: 'LA_US',
            localities: [
                { name: 'New Orleans', slug: 'new-orleans' },
                { name: 'Baton Rouge', slug: 'baton-rouge' },
            ],
        },
        {
            name: 'Maine',
            code: 'ME',
            localities: [
                { name: 'Portland', slug: 'portland-me' },
                { name: 'Augusta', slug: 'augusta-me' },
            ],
        },
        {
            name: 'Maryland',
            code: 'MD_US',
            localities: [
                { name: 'Baltimore', slug: 'baltimore' },
                { name: 'Rockville', slug: 'rockville' },
            ],
        },
        {
            name: 'Massachusetts',
            code: 'MA_US',
            localities: [
                { name: 'Boston', slug: 'boston' },
                { name: 'Worcester', slug: 'worcester' },
                { name: 'Cambridge', slug: 'cambridge-ma' },
            ],
        },
        {
            name: 'Michigan',
            code: 'MI_US',
            localities: [
                { name: 'Detroit', slug: 'detroit' },
                { name: 'Grand Rapids', slug: 'grand-rapids' },
                { name: 'Ann Arbor', slug: 'ann-arbor' },
            ],
        },
        {
            name: 'Minnesota',
            code: 'MN',
            localities: [
                { name: 'Minneapolis', slug: 'minneapolis' },
                { name: 'Saint Paul', slug: 'saint-paul' },
            ],
        },
        {
            name: 'Mississippi',
            code: 'MS',
            localities: [
                { name: 'Jackson', slug: 'jackson-ms' },
                { name: 'Gulfport', slug: 'gulfport' },
            ],
        },
        {
            name: 'Missouri',
            code: 'MO_US',
            localities: [
                { name: 'Kansas City', slug: 'kansas-city-mo' },
                { name: 'St. Louis', slug: 'st-louis' },
            ],
        },
        {
            name: 'Montana',
            code: 'MT',
            localities: [
                { name: 'Billings', slug: 'billings' },
                { name: 'Missoula', slug: 'missoula' },
            ],
        },
        {
            name: 'Nebraska',
            code: 'NE_US',
            localities: [
                { name: 'Omaha', slug: 'omaha' },
                { name: 'Lincoln', slug: 'lincoln-ne' },
            ],
        },
        {
            name: 'Nevada',
            code: 'NV',
            localities: [
                { name: 'Las Vegas', slug: 'las-vegas' },
                { name: 'Reno', slug: 'reno' },
                { name: 'Henderson', slug: 'henderson' },
            ],
        },
        {
            name: 'New Hampshire',
            code: 'NH',
            localities: [
                { name: 'Manchester', slug: 'manchester-nh' },
                { name: 'Nashua', slug: 'nashua' },
            ],
        },
        {
            name: 'New Jersey',
            code: 'NJ',
            localities: [
                { name: 'Newark', slug: 'newark' },
                { name: 'Jersey City', slug: 'jersey-city' },
                { name: 'Trenton', slug: 'trenton' },
            ],
        },
        {
            name: 'New Mexico',
            code: 'NM',
            localities: [
                { name: 'Albuquerque', slug: 'albuquerque' },
                { name: 'Santa Fe', slug: 'santa-fe-nm' },
            ],
        },
        {
            name: 'New York',
            code: 'NY',
            localities: [
                { name: 'New York City', slug: 'new-york-city' },
                { name: 'Buffalo', slug: 'buffalo' },
                { name: 'Rochester', slug: 'rochester-ny' },
                { name: 'Albany', slug: 'albany' },
            ],
        },
        {
            name: 'North Carolina',
            code: 'NC_US',
            localities: [
                { name: 'Charlotte', slug: 'charlotte' },
                { name: 'Raleigh', slug: 'raleigh' },
                { name: 'Durham', slug: 'durham' },
            ],
        },
        {
            name: 'North Dakota',
            code: 'ND',
            localities: [
                { name: 'Fargo', slug: 'fargo' },
                { name: 'Bismarck', slug: 'bismarck' },
            ],
        },
        {
            name: 'Ohio',
            code: 'OH',
            localities: [
                { name: 'Columbus', slug: 'columbus-oh' },
                { name: 'Cleveland', slug: 'cleveland' },
                { name: 'Cincinnati', slug: 'cincinnati' },
            ],
        },
        {
            name: 'Oklahoma',
            code: 'OK',
            localities: [
                { name: 'Oklahoma City', slug: 'oklahoma-city' },
                { name: 'Tulsa', slug: 'tulsa' },
            ],
        },
        {
            name: 'Oregon',
            code: 'OR',
            localities: [
                { name: 'Portland', slug: 'portland-or' },
                { name: 'Salem', slug: 'salem-or' },
                { name: 'Eugene', slug: 'eugene' },
            ],
        },
        {
            name: 'Pennsylvania',
            code: 'PA_US',
            localities: [
                { name: 'Philadelphia', slug: 'philadelphia' },
                { name: 'Pittsburgh', slug: 'pittsburgh' },
                { name: 'Harrisburg', slug: 'harrisburg' },
            ],
        },
        {
            name: 'Rhode Island',
            code: 'RI_US',
            localities: [{ name: 'Providence', slug: 'providence' }],
        },
        {
            name: 'South Carolina',
            code: 'SC_US',
            localities: [
                { name: 'Charleston', slug: 'charleston-sc' },
                { name: 'Columbia', slug: 'columbia-sc' },
            ],
        },
        {
            name: 'South Dakota',
            code: 'SD',
            localities: [
                { name: 'Sioux Falls', slug: 'sioux-falls' },
                { name: 'Rapid City', slug: 'rapid-city' },
            ],
        },
        {
            name: 'Tennessee',
            code: 'TN',
            localities: [
                { name: 'Nashville', slug: 'nashville' },
                { name: 'Memphis', slug: 'memphis' },
                { name: 'Knoxville', slug: 'knoxville' },
            ],
        },
        {
            name: 'Texas',
            code: 'TX',
            localities: [
                { name: 'Houston', slug: 'houston' },
                { name: 'San Antonio', slug: 'san-antonio-tx' },
                { name: 'Dallas', slug: 'dallas' },
                { name: 'Austin', slug: 'austin' },
                { name: 'Fort Worth', slug: 'fort-worth' },
                { name: 'El Paso', slug: 'el-paso' },
            ],
        },
        {
            name: 'Utah',
            code: 'UT',
            localities: [
                { name: 'Salt Lake City', slug: 'salt-lake-city' },
                { name: 'Provo', slug: 'provo' },
            ],
        },
        {
            name: 'Vermont',
            code: 'VT',
            localities: [{ name: 'Burlington', slug: 'burlington-vt' }],
        },
        {
            name: 'Virginia',
            code: 'VA_US',
            localities: [
                { name: 'Virginia Beach', slug: 'virginia-beach' },
                { name: 'Norfolk', slug: 'norfolk' },
                { name: 'Richmond', slug: 'richmond-va' },
            ],
        },
        {
            name: 'Washington',
            code: 'WA',
            localities: [
                { name: 'Seattle', slug: 'seattle' },
                { name: 'Spokane', slug: 'spokane' },
                { name: 'Tacoma', slug: 'tacoma' },
            ],
        },
        {
            name: 'West Virginia',
            code: 'WV',
            localities: [
                { name: 'Charleston', slug: 'charleston-wv' },
                { name: 'Huntington', slug: 'huntington-wv' },
            ],
        },
        {
            name: 'Wisconsin',
            code: 'WI',
            localities: [
                { name: 'Milwaukee', slug: 'milwaukee' },
                { name: 'Madison', slug: 'madison-wi' },
            ],
        },
        {
            name: 'Wyoming',
            code: 'WY',
            localities: [
                { name: 'Cheyenne', slug: 'cheyenne' },
                { name: 'Casper', slug: 'casper' },
            ],
        },
    ],
};
