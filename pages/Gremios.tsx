import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Institucion } from '../types';
import Spinner from '../components/ui/Spinner';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Gremios: React.FC = () => {
    const [instituciones, setInstituciones] = useState<Institucion[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchGremios = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('instituciones')
            .select('*')
            .order('nombre', { ascending: true });

        if (error) {
            console.error('Error fetching institutions:', error);
            alert('Error al cargar los gremios.');
        } else {
            setInstituciones(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchGremios();
    }, []);

    const handleDelete = async (rif: string) => {
        if (window.confirm('¿Está seguro de que desea eliminar este gremio? Esta acción no se puede deshacer.')) {
            // Note: Deleting an institution might fail if it's referenced by establishments.
            // Proper handling would involve checking for dependencies first.
            const { error } = await supabase.from('instituciones').delete().eq('rif', rif);
            if (error) {
                console.error('Error deleting institution:', error);
                alert(`Error al eliminar el gremio: ${error.message}`);
            } else {
                alert('Gremio eliminado exitosamente.');
                fetchGremios();
            }
        }
    };
    
    if (loading) return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>;

    return (
        <div className="bg-ciec-card p-6 rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gremios / Instituciones</h1>
                <Link to="/gremios/nuevo" className="flex items-center bg-ciec-blue hover:bg-ciec-blue-hover text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    <Plus className="w-5 h-5 mr-2" /> Añadir
                </Link>
            </div>
            <div className="space-y-3">
                {instituciones.map(gremio => (
                    <div key={gremio.rif} className="flex items-center justify-between bg-ciec-bg p-4 rounded-lg">
                        <div>
                            <span className="font-medium">{gremio.nombre}</span>
                            <p className="text-sm text-ciec-text-secondary">{gremio.rif}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            {/* Edit link can be added later if an edit form is created */}
                            {/* <Link to={`/gremios/editar/${gremio.rif}`} className="text-ciec-text-secondary hover:text-ciec-blue"><Edit className="w-5 h-5" /></Link> */}
                            <button onClick={() => handleDelete(gremio.rif)} className="text-ciec-text-secondary hover:text-red-500">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Gremios;