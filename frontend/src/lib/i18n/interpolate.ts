export function t(template: string, vars: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (_, key: string) => {
        const val = vars[key];
        return val !== undefined ? String(val) : `{${key}}`;
    });
}
