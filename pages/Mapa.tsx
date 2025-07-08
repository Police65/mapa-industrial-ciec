
import React, { useState, useEffect } from 'react';
import { GoogleMap, MarkerF } from '@react-google-maps/api';
import { supabase } from '../lib/supabase';
import { Empresa } from '../types';
import Spinner from '../components/ui/Spinner';
import { darkMapStyle } from '../styles/mapStyles';

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '0.5rem',
};

const center = {
    lat: 10.24,
    lng: -67.9,
};

const mapOptions = {
    styles: darkMapStyle,
    mapTypeControl: true,
    zoomControl: true,
    streetViewControl: false,
    fullscreenControl: false,
};

const Mapa: React.FC = () => {
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

    if (loading) {
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
                options={mapOptions}
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
