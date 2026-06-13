const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? 
            walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function migrateFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    
    let original = fs.readFileSync(filePath, 'utf-8');
    let content = original;
    let modified = false;

    // 1. Replace <button className="btn-primary ..."> with <Btn variant="primary">
    // This regex looks for `<button` followed by any attributes, `className="...btn-primary..."`, and closing `>`.
    const btnPrimaryRegex = /<button([^>]*?)className=["']([^"']*?)btn-primary([^"']*?)["']([^>]*?)>/g;
    if (btnPrimaryRegex.test(content)) {
        content = content.replace(btnPrimaryRegex, (match, p1, p2, p3, p4) => {
            // Keep other attributes, but maybe drop className completely since Btn handles it, or pass them.
            // For Btn, we usually don't need the big className if we pass variant="primary".
            // Let's extract type="submit" or onClick
            let attrs = (p1 + p4).replace(/\s+/g, ' ').trim();
            // check for disabled
            let disabledMatch = attrs.match(/disabled={([^}]+)}/);
            let typeMatch = attrs.match(/type=["']([^"']+)["']/);
            let onClickMatch = attrs.match(/onClick={([^}]+)}/);
            
            let newAttrs = 'variant="primary"';
            if (typeMatch) newAttrs += ` type="${typeMatch[1]}"`;
            if (disabledMatch) newAttrs += ` disabled={${disabledMatch[1]}}`;
            if (onClickMatch) newAttrs += ` onClick={${onClickMatch[1]}}`;
            
            return `<Btn ${newAttrs}>`;
        });
        
        // Also need to replace the closing </button> with </Btn> IF we replaced the opening tag.
        // Simple heuristic: if we replaced `<button` with `btn-primary`, we can try to balance or just do a generic replace.
        // Actually it's safer to just replace all `</button>` with `</Btn>` ONLY if there are no other <button> tags,
        // but there might be. So let's use a smarter regex for the whole block:
    }
    
    // Let's use a safer block regex:
    const fullButtonRegex = /<button([^>]*?)className=["']([^"']*?)btn-primary([^"']*?)["']([^>]*?)>([\s\S]*?)<\/button>/g;
    if (fullButtonRegex.test(original)) {
        content = original.replace(fullButtonRegex, (match, p1, p2, p3, p4, innerText) => {
            let attrs = (p1 + ' ' + p4).replace(/\s+/g, ' ').trim();
            let disabledMatch = attrs.match(/disabled={([^}]+)}/);
            let typeMatch = attrs.match(/type=["']([^"']+)["']/);
            let onClickMatch = attrs.match(/onClick={([^}]+)}/);
            
            let newAttrs = 'variant="primary"';
            if (typeMatch) newAttrs += ` type="${typeMatch[1]}"`;
            if (disabledMatch) newAttrs += ` disabled={${disabledMatch[1]}}`;
            if (onClickMatch) newAttrs += ` onClick={${onClickMatch[1]}}`;
            
            return `<Btn ${newAttrs}>${innerText}</Btn>`;
        });
        modified = true;
    }
    
    // Check for the "Cancelar" buttons which use bg-tint
    const cancelRegex = /<button([^>]*?)className=["']([^"']*?)hover:bg-tint([^"']*?)["']([^>]*?)>\s*Cancelar\s*<\/button>/g;
    if (cancelRegex.test(content)) {
        content = content.replace(cancelRegex, (match, p1, p2, p3, p4) => {
            let attrs = (p1 + ' ' + p4).replace(/\s+/g, ' ').trim();
            let disabledMatch = attrs.match(/disabled={([^}]+)}/);
            let typeMatch = attrs.match(/type=["']([^"']+)["']/);
            let onClickMatch = attrs.match(/onClick={([^}]+)}/);
            
            let newAttrs = 'variant="secondary"';
            if (typeMatch) newAttrs += ` type="${typeMatch[1]}"`;
            if (disabledMatch) newAttrs += ` disabled={${disabledMatch[1]}}`;
            if (onClickMatch) newAttrs += ` onClick={${onClickMatch[1]}}`;
            
            return `<Btn ${newAttrs}>Cancelar</Btn>`;
        });
        modified = true;
    }

    if (modified) {
        // Ensure Btn is imported
        if (!content.includes("import { Btn") && !content.includes("import {Btn")) {
            // Find existing hireeo import
            if (content.includes("@/shared/components/hireeo")) {
                content = content.replace(/import\s*\{([^}]+)\}\s*from\s*['"]@\/shared\/components\/hireeo['"];/, (match, imports) => {
                    if (!imports.includes("Btn")) {
                        return `import { ${imports.trim()}, Btn } from '@/shared/components/hireeo';`;
                    }
                    return match;
                });
            } else {
                content = `import { Btn } from '@/shared/components/hireeo';\n` + content;
            }
        }
        
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated ${filePath}`);
    }
}

walkDir(path.join(__dirname, 'src'), migrateFile);
