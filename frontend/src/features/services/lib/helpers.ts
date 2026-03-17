export function generateSlug(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-') // Reemplazar espacios con -
        .replace(/[^\w-]+/g, '') // Eliminar caracteres no válidos
        .replace(/--+/g, '-'); // Reemplazar múltiples - con uno solo
}
