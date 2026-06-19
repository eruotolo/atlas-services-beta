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

    // Replace <Link className="btn-primary ..."> con <Btn href="...">
    const linkPrimaryRegex = /<Link([^>]*?)className=["']([^"']*?)btn-primary([^"']*?)["']([^>]*?)>(.*?)<\/Link>/gs;
    if (linkPrimaryRegex.test(original)) {
        content = original.replace(linkPrimaryRegex, (match, p1, p2, p3, p4, innerText) => {
            let attrs = (p1 + ' ' + p4).replace(/\s+/g, ' ').trim();
            let hrefMatch = attrs.match(/href={([^}]+)}/) || attrs.match(/href=["']([^"']+)["']/);
            
            let newAttrs = 'variant="primary"';
            if (hrefMatch) {
                // Determine if it's a JSX expression or string
                let hrefVal = hrefMatch[1];
                if (attrs.includes(`href={${hrefVal}}`)) {
                    newAttrs += ` href={${hrefVal}}`;
                } else {
                    newAttrs += ` href="${hrefVal}"`;
                }
            }
            // we should also include the icon if there is one inside, but for now we just wrap innerText.
            // Wait, Btn supports href directly if it renders as an a tag, but if it uses Link under the hood it's fine.
            return `<Btn ${newAttrs}>${innerText}</Btn>`;
        });
        modified = true;
    }

    if (modified) {
        if (!content.includes("import { Btn") && !content.includes("import {Btn")) {
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
