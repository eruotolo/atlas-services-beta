import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

// Países soportados actualmente por Atlas Services
const SUPPORTED_COUNTRIES = ['cl', 'ar', 'us', 'uy', 'es'];
const DEFAULT_COUNTRY = 'cl';

export default async function RootPage() {
    // 1. Verificar si el usuario ya eligió un país manualmente (Cookie guardada por el Footer)
    const cookieStore = await cookies();
    const savedCountry = cookieStore.get('hireeo_country')?.value;
    
    if (savedCountry && SUPPORTED_COUNTRIES.includes(savedCountry)) {
        redirect(`/${savedCountry}`);
    }

    // 2. Si no hay cookie, detectar por IP
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    
    // Extraer la IP real del cliente
    let ip = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp;
    
    // Ignorar IPs locales (localhost)
    if (!ip || ip === '::1' || ip === '127.0.0.1') {
        ip = null;
    }

    let countryCode = DEFAULT_COUNTRY;

    if (ip) {
        try {
            // Consultamos la API pública de ip-api.com
            // Usamos 'no-store' para asegurar que la redirección sea dinámica por usuario
            const res = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, {
                cache: 'no-store',
                next: { revalidate: 0 }
            });
            
            if (res.ok) {
                const data = await res.json();
                if (data && data.countryCode) {
                    const detectedCode = data.countryCode.toLowerCase();
                    // Solo redirigimos si es un país que nuestra plataforma opera
                    if (SUPPORTED_COUNTRIES.includes(detectedCode)) {
                        countryCode = detectedCode;
                    }
                }
            }
        } catch (err) {
            console.error('[Geolocator] Error fetching IP data:', err);
        }
    }

    // Redirige al subdirectorio del país correspondiente
    redirect(`/${countryCode}`);
}
