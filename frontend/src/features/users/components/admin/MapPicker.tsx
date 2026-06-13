'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leafet default icon issue in Next.js/Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapPickerProps {
    position: [number, number];
    onChange: (pos: [number, number]) => void;
    zoom?: number;
}

function LocationMarker({ position, onChange }: MapPickerProps) {
    const map = useMap();
    
    // Al hacer click en el mapa, movemos el pin
    useMapEvents({
        click(e) {
            onChange([e.latlng.lat, e.latlng.lng]);
        },
    });

    // Animar el mapa al cambiar la posición (ej. geocoding)
    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom(), { animate: true });
        }
    }, [position, map]);

    return position ? (
        <Marker
            position={position}
            draggable={true}
            eventHandlers={{
                dragend: (e) => {
                    const marker = e.target;
                    const pos = marker.getLatLng();
                    onChange([pos.lat, pos.lng]);
                },
            }}
        />
    ) : null;
}

export default function MapPicker({ position, onChange, zoom = 14 }: MapPickerProps) {
    return (
        <div className="h-[300px] w-full overflow-hidden rounded-xl border border-line">
            <MapContainer
                center={position}
                zoom={zoom}
                scrollWheelZoom={true}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} onChange={onChange} />
            </MapContainer>
        </div>
    );
}
