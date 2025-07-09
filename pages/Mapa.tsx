import React, { useState, useEffect } from 'react';
import { GoogleMap, MarkerF } from '@react-google-maps/api';
import { supabase } from '../lib/supabase';
import { Establecimiento, Direccion } from '../types';
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

type EstablecimientoConDireccion = Establecimiento & {
    direcciones: Pick<Direccion, 'latitud' | 'longitud'> | null
}

const Mapa: React.FC = () => {
    const [establecimientos, setEstablecimientos] = useState<EstablecimientoConDireccion[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEstablecimientos = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('establecimientos')
                .select('id_establecimiento, nombre_establecimiento, direcciones(latitud, longitud)')
                .not('direcciones.latitud', 'is', null)
                .not('direcciones.longitud', 'is', null);

            if (error) {
                console.error('Error fetching establishments:', error);
            } else if (data) {
                setEstablecimientos(data as EstablecimientoConDireccion[]);
            }
            setLoading(false);
        };

        fetchEstablecimientos();
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
                {establecimientos.map((est) => (
                    est.direcciones?.latitud && est.direcciones?.longitud && (
                        <MarkerF
                            key={est.id_establecimiento}
                            position={{ lat: est.direcciones.latitud, lng: est.direcciones.longitud }}
                            title={est.nombre_establecimiento || 'Establecimiento'}
                        />
                    )
                ))}
            </GoogleMap>
        </div>
    );
};

export default Mapa;