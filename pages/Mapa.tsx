import React, { useState, useEffect } from 'react';
import { GoogleMap, MarkerF, InfoWindow } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Establecimiento, Direccion, Compania } from '../types';
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

// Definimos un tipo más completo para los datos que vamos a necesitar
type MapPinData = {
    id: number | string; // Acepta número para establecimientos y string para RIF de instituciones
    nombre: string;
    lat: number;
    lng: number;
    razon_social?: string;
    type: 'establecimiento' | 'institucion';
};

const Mapa: React.FC = () => {
    const [pins, setPins] = useState<MapPinData[]>([]);
    const [selectedPin, setSelectedPin] = useState<MapPinData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMapData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Ejecutamos ambas consultas en paralelo para mayor eficiencia
                const [
                    { data: estData, error: estError }, 
                    { data: instData, error: instError }
                ] = await Promise.all([
                    supabase
                        .from('establecimientos')
                        .select(`
                            id_establecimiento, 
                            nombre_establecimiento, 
                            companias ( razon_social ), 
                            direcciones ( latitud, longitud )
                        `),
                    supabase
                        .from('instituciones')
                        .select(`
                            rif,
                            nombre,
                            direcciones ( latitud, longitud )
                        `)
                ]);

                if (estError) throw estError;
                if (instError) throw instError;

                // Mapeamos los datos a un formato unificado, asegurándonos de que tengan ubicación
                const establishmentPins: MapPinData[] = (estData || [])
                    .filter((est: any) => est.direcciones?.latitud && est.direcciones?.longitud)
                    .map((est: any) => ({
                        id: est.id_establecimiento,
                        nombre: est.nombre_establecimiento || 'Establecimiento sin nombre',
                        lat: est.direcciones.latitud,
                        lng: est.direcciones.longitud,
                        razon_social: est.companias?.razon_social,
                        type: 'establecimiento',
                    }));

                const institutionPins: MapPinData[] = (instData || [])
                    .filter((inst: any) => inst.direcciones?.latitud && inst.direcciones?.longitud)
                    .map((inst: any) => ({
                        id: inst.rif,
                        nombre: inst.nombre,
                        lat: inst.direcciones.latitud,
                        lng: inst.direcciones.longitud,
                        type: 'institucion',
                    }));

                setPins([...establishmentPins, ...institutionPins]);

            } catch (err: any) {
                console.error("Error fetching map data:", err);
                setError("No se pudieron cargar los datos del mapa. Por favor, intente de nuevo más tarde.");
            } finally {
                setLoading(false); // Esto se ejecutará siempre, incluso si hay un error
            }
        };

        fetchMapData();
    }, []);

    const handleMarkerClick = (pin: MapPinData) => {
        setSelectedPin(pin);
    };

    const handleInfoWindowClose = () => {
        setSelectedPin(null);
    };

    const handleViewDetails = (pin: MapPinData) => {
        if (pin.type === 'establecimiento') {
            navigate(`/empresas/editar/${pin.id}`);
        }
        // Aquí se podría agregar la navegación para ver detalles de una institución si existiera esa vista
        // else { navigate(`/gremios/detalle/${pin.id}`); }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full text-red-400 bg-red-900/50 p-4 rounded-lg">
                {error}
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
                onClick={handleInfoWindowClose} // Cierra el InfoWindow si se hace clic en cualquier parte del mapa
            >
                {pins.map((pin) => (
                    <MarkerF
                        key={`${pin.type}-${pin.id}`}
                        position={{ lat: pin.lat, lng: pin.lng }}
                        title={pin.nombre}
                        onClick={() => handleMarkerClick(pin)}
                        icon={{
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 8,
                            fillColor: pin.type === 'establecimiento' ? '#2563eb' : '#f59e0b', // Azul para establecimientos, dorado para instituciones
                            fillOpacity: 1,
                            strokeWeight: 2,
                            strokeColor: '#ffffff'
                        }}
                    />
                ))}

                {selectedPin && (
                    <InfoWindow
                        position={{ lat: selectedPin.lat, lng: selectedPin.lng }}
                        onCloseClick={handleInfoWindowClose}
                    >
                        <div className="p-2 bg-ciec-card text-ciec-text-primary rounded-lg shadow-lg max-w-xs">
                           <h3 className="font-bold text-md mb-1">{selectedPin.nombre}</h3>
                           {selectedPin.razon_social && (
                               <p className="text-sm text-ciec-text-secondary mb-3">{selectedPin.razon_social}</p>
                           )}
                           
                           {selectedPin.type === 'establecimiento' && (
                                <button 
                                    onClick={() => handleViewDetails(selectedPin)}
                                    className="w-full bg-ciec-blue hover:bg-ciec-blue-hover text-white font-bold py-1 px-3 rounded-md text-sm transition-colors"
                                >
                                    Ver más detalle
                                </button>
                           )}
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
};

export default Mapa;
