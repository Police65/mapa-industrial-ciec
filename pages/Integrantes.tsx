
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Integrante } from '../types';
import Spinner from '../components/ui/Spinner';
import { Plus } from 'lucide-react';

const Integrantes: React.FC = () => {
    const [integrantes, setIntegrantes] = useState<Integrante[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIntegrantes = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('integrantes')
                .select('*')
                .order('nombre', { ascending: true });

            if (error) {
                console.error('Error fetching members:', error);
            } else {
                setIntegrantes(data as any[] || []); // Cast to any to bypass temporary type mismatch
            }
            setLoading(false);
        };

        fetchIntegrantes();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>;

    return (
        <div className="bg-ciec-card p-6 rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Integrantes</h1>
                <Link to="/integrantes/nuevo" className="flex items-center bg-ciec-blue hover:bg-ciec-blue-hover text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    <Plus className="w-5 h-5 mr-2" /> Add
                </Link>
            </div>
            <div className="divide-y divide-ciec-border">
                {integrantes.map(integrante => (
                    <div key={integrante.id} className="flex items-center justify-between py-4">
                        <div>
                            <p className="font-semibold">{integrante.nombre}</p>
                            <p className="text-sm text-ciec-text-secondary">{integrante.email}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-ciec-text-primary">{integrante.empresa || 'N/A'}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Integrantes;
