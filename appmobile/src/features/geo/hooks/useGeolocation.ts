import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';

interface GeolocationState {
    readonly cityName: string | null;
    readonly isLocating: boolean;
    readonly permissionDenied: boolean;
    readonly retry: () => void;
}

async function resolveCity(): Promise<string | null> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== Location.PermissionStatus.GRANTED) return null;

    // Check OS-level location toggle before calling any position API.
    // This avoids an internal expo-location error log when the device GPS is off.
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) return null;

    // Try last known position first — works without active GPS fix
    let position = await Location.getLastKnownPositionAsync({
        maxAge: 60 * 60 * 1000,   // accept up to 1h old
        requiredAccuracy: 10_000, // 10km is enough for city-level
    });

    // Fall back to live GPS only if no cache available
    if (position == null) {
        position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Low,
        });
    }

    const results = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
    });

    const place = results[0];
    if (place == null) return null;

    const raw =
        place.city ??
        place.district ??
        place.subregion ??
        place.region ??
        place.name ??
        null;

    if (raw == null) return null;
    return raw.length > 22 ? `${raw.slice(0, 20).trimEnd()}…` : raw;
}

export function useGeolocation(): GeolocationState {
    const [cityName, setCityName] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState(true);
    const [permissionDenied, setPermissionDenied] = useState(false);

    const locate = useCallback((): void => {
        setIsLocating(true);
        setPermissionDenied(false);

        resolveCity()
            .then((city) => {
                setPermissionDenied(city == null);
                setCityName(city);
            })
            .catch(() => {
                setCityName(null);
            })
            .finally(() => setIsLocating(false));
    }, []);

    useEffect(() => {
        locate();
    }, [locate]);

    return { cityName, isLocating, permissionDenied, retry: locate };
}
