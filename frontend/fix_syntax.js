const fs = require('fs');
const path = require('path');

// 1. Fix cn in utils.ts
const utilsPath = path.join(__dirname, 'src/shared/lib/utils.ts');
let utilsContent = fs.readFileSync(utilsPath, 'utf-8');
if (!utilsContent.includes('export function cn')) {
    utilsContent += "\nexport function cn(...classes: (string | undefined | null | false)[]) {\n    return classes.filter(Boolean).join(' ');\n}\n";
    fs.writeFileSync(utilsPath, utilsContent, 'utf-8');
    console.log('Added cn to utils.ts');
}

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

    // Fix missing ColumnDef import in CountriesTable.tsx
    if (file.includes('CountriesTable')) {
        content = content.replace(
            /import type \{ Column \} from '@\/shared\/components\/ui\/data-table\/DataTable';/g,
            "import { ColumnDef } from '@tanstack/react-table';"
        );
        content = content.replace(
            /import \{ Column \} from '@\/shared\/components\/ui\/data-table\/DataTable';/g,
            "import { ColumnDef } from '@tanstack/react-table';"
        );
    }

    // Replace className: '...' with meta: { className: '...' } inside columns array
    // Only where we define columns!
    content = content.replace(/className:\s*('[^']+'|"[^"]+"|`[^`]+`)/g, "meta: { className: $1 }");

    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`Fixed ${file}`);
}
