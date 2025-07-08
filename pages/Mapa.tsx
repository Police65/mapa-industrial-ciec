
import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY } from '../constants';
import { supabase } from '../lib/supabase';
import { Empresa } from '../types';
import Spinner from '../components/ui/Spinner';

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '0.5rem',
};

const center = {
    lat: 10.24,
    lng: -67.9,
};

const Mapa: React.FC = () => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    });

    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmpresas = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('empresas')
                .select('code, nombre_establecimiento, latitude, longitude')
                .not('latitude', 'is', null)
                .not('longitude', 'is', null);

            if (error) {
                console.error('Error fetching companies:', error);
            } else if (data) {
                setEmpresas(data as Empresa[]);
            }
            setLoading(false);
        };

        fetchEmpresas();
    }, []);

    if (loading || !isLoaded) {
        return (
            <div className="flex items-center justify-center h-full">
                <Spinner size="lg" />
            </div>
        );
    }
    
    return (
        <div className="h-full w-full bg-ciec-card p-1 rounded-lg">
             <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={10}
                options={{
                    styles: [ // Dark mode styles
                        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                        {
                            featureType: "administrative.locality",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#d59563" }],
                        },
                        {
                            featureType: "poi",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#d59563" }],
                        },
                        {
                            featureType: "poi.park",
                            elementType: "geometry",
                            stylers: [{ color: "#263c3f" }],
                        },
                        {
                            featureType: "poi.park",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#6b9a76" }],
                        },
                        {
                            featureType: "road",
                            elementType: "geometry",
                            stylers: [{ color: "#38414e" }],
                        },
                        {
                            featureType: "road",
                            elementType: "geometry.stroke",
                            stylers: [{ color: "#212a37" }],
                        },
                        {
                            featureType: "road",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#9ca5b3" }],
                        },
                        {
                            featureType: "road.highway",
                            elementType: "geometry",
                            stylers: [{ color: "#746855" }],
                        },
                        {
                            featureType: "road.highway",
                            elementType: "geometry.stroke",
                            stylers: [{ color: "#1f2835" }],
                        },
                        {
                            featureType: "road.highway",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#f3d19c" }],
                        },
                        {
                            featureType: "transit",
                            elementType: "geometry",
                            stylers: [{ color: "#2f3948" }],
                        },
                        {
                            featureType: "transit.station",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#d59563" }],
                        },
                        {
                            featureType: "water",
                            elementType: "geometry",
                            stylers: [{ color: "#17263c" }],
                        },
                        {
                            featureType: "water",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#515c6d" }],
                        },
                        {
                            featureType: "water",
                            elementType: "labels.text.stroke",
                            stylers: [{ color: "#17263c" }],
                        },
                    ],
                    disableDefaultUI: true,
                    zoomControl: true,
                }}
            >
                {empresas.map((empresa) => (
                    empresa.latitude && empresa.longitude && (
                        <MarkerF
                            key={empresa.code}
                            position={{ lat: empresa.latitude, lng: empresa.longitude }}
                            title={empresa.nombre_establecimiento || 'Empresa'}
                        />
                    )
                ))}
            </GoogleMap>
        </div>
    );
};

export default Mapa;
