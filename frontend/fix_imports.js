const fs = require('fs');
const path = require('path');

const files = [
    'src/features/analytics/components/admin/InteraccionesTable.tsx',
    'src/features/categories/components/admin/CategoriasTable.tsx',
    'src/features/configuration/countries/components/CountriesTable/CountriesTable.tsx',
    'src/features/payments/components/admin/PagosTable.tsx',
    'src/features/payments/premium/components/PreciosPremiumTable.tsx',
    'src/features/reviews/components/admin/CalificacionesTable.tsx',
    'src/features/services/components/admin/ServiciosTable.tsx',
    'src/features/sponsors/components/admin/SponsorsTable.tsx',
    'src/features/users/components/admin/UsuariosTable.tsx'
];

for (const file of files) {
    const fullPath = path.join(__dirname, file);
    if (!fs.existsSync(fullPath)) continue;
    let content = fs.readFileSync(fullPath, 'utf-8');

    content = content.replace(
        /import \{ useDataTable \} from '@\/shared\/components\/ui\/data-table\/useDataTable';/g,
        "import { useDataTable } from '@/shared/components/DataTable/useDataTable';"
    );
    // There might also be a stray import from `ui/data-table` for `useDataTable`
    content = content.replace(
        /import \{ useDataTable \} from '@\/shared\/components\/ui\/data-table';/g,
        "import { useDataTable } from '@/shared/components/DataTable/useDataTable';"
    );

    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`Fixed imports in ${file}`);
}
