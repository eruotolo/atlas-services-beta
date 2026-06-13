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
    if (!fs.existsSync(fullPath)) {
        console.log(`Skipping ${file}`);
        continue;
    }
    
    // Read original if it's CountriesTable which we couldn't checkout, actually I'll just rely on what is there.
    // Wait, CountriesTable has the BAD code right now!
    // I should fix CountriesTable manually first or reset it to git HEAD. Wait, it's untracked so it has no git HEAD.
    // I will read it and fix the syntax errors.
    
    let content = fs.readFileSync(fullPath, 'utf-8');

    // Restore CountriesTable.tsx if it has the bad format from the previous run
    if (file.includes('CountriesTable')) {
        content = content.replace(/cell: \(\{ row \}\) => \{\n            const (\w+) = row\.original;\n            return \(/g, "cell: ($1) => (");
        content = content.replace(/cell: \(\{ row: \{ original: (\w+) \} \}\) =>/g, "cell: ($1) =>");
        content = content.replace(/import \{ ColumnDef \} from '@tanstack\/react-table';/g, "import { Column } from '@/shared/components/ui/data-table';");
        content = content.replace(/const columns: ColumnDef<([^>]+)>\[\]/g, 'const columns: Column<$1>[]');
        content = content.replace(/columns: ColumnDef<([^>]+)>\[\]/g, 'columns: Column<$1>[]');
    }

    // Now apply safe replacements
    content = content.replace(
        /import type \{ Column \} from '@\/shared\/components\/ui\/data-table';/g,
        "import { ColumnDef } from '@tanstack/react-table';"
    );
    content = content.replace(
        /import \{ Column \} from '@\/shared\/components\/ui\/data-table';/g,
        "import { ColumnDef } from '@tanstack/react-table';"
    );
    content = content.replace(
        /import \{ DataTable \} from '@\/shared\/components\/ui\/data-table';/g,
        "import { DataTable } from '@/shared/components/DataTable';"
    );
    content = content.replace(
        /import DataTable, \{ type Column \} from '@\/shared\/components\/ui\/data-table\/DataTable';/g,
        "import { ColumnDef } from '@tanstack/react-table';\nimport { DataTable } from '@/shared/components/DataTable';"
    );

    // Update Type signatures
    content = content.replace(/const columns: Column<([^>]+)>\[\]/g, 'const columns: ColumnDef<$1>[]');
    content = content.replace(/columns: Column<([^>]+)>\[\]/g, 'columns: ColumnDef<$1>[]');

    // Safe cell replacement
    content = content.replace(/cell:\s*\(\s*([a-zA-Z0-9_]+)\s*\)\s*=>/g, "cell: ({ row: { original: $1 } }) =>");

    // Do not remove useDataTable since they still use the hook in their component!
    // content = content.replace(/import \{ useDataTable \} from '@\/shared\/components\/ui\/data-table\/useDataTable';\n?/g, "");

    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`Updated ${file}`);
}
