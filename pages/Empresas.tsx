import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Empresa, Afiliacion } from '../types';
import Spinner from '../components/ui/Spinner';
import { Building, AlertTriangle } from 'lucide-react';
import EmpresaFormDrawer from '../components/empresa/EmpresaFormDrawer';

const Empresas: React.FC = () => {
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [afiliaciones, setAfiliaciones] = useState<Afiliacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAfiliacion, setSelectedAfiliacion] = useState<string>('All');
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: empresasData, error: empresasError } = await supabase.from('empresas').select('*');
            const { data: afiliacionesData, error: afiliacionesError } = await supabase.from('afiliaciones').select('*');

            if (empresasError) console.error('Error fetching companies:', empresasError);
            else setEmpresas(empresasData || []);

            if (afiliacionesError) console.error('Error fetching affiliations:', afiliacionesError);
            else setAfiliaciones(afiliacionesData || []);

            setLoading(false);
        };
        fetchData();

        const channel = supabase.channel('empresas-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'empresas' }, (payload) => {
            fetchData();
          })
          .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const filteredEmpresas = useMemo(() => {
        if (selectedAfiliacion === 'All') return empresas;
        if (selectedAfiliacion === '(empty)') return empresas.filter(e => !e.afiliacion_id);
        return empresas.filter(e => e.afiliacion_id === selectedAfiliacion);
    }, [empresas, selectedAfiliacion]);
    
    const afiliacionCounts = useMemo(() => {
        const counts: { [key: string]: number } = {'(empty)': 0};
        empresas.forEach(empresa => {
            if (empresa.afiliacion_id) {
                 counts[empresa.afiliacion_id] = (counts[empresa.afiliacion_id] || 0) + 1;
            } else {
                counts['(empty)']++;
            }
        });
        return counts;
    }, [empresas]);


    if (loading) return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>;

    return (
        <div className="flex h-full relative">
            <EmpresaFormDrawer />
            <div className="w-1/4 max-w-xs bg-ciec-card p-4 rounded-l-lg overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4">Gremios</h2>
                <ul>
                    <li
                        onClick={() => setSelectedAfiliacion('All')}
                        className={`p-2 rounded-md cursor-pointer flex justify-between items-center ${selectedAfiliacion === 'All' ? 'bg-ciec-blue' : 'hover:bg-ciec-border'}`}
                    >
                       <span>All</span>
                       <span className="text-xs bg-gray-500 text-white rounded-full px-2 py-0.5">{empresas.length}</span>
                    </li>
                     <li
                        onClick={() => setSelectedAfiliacion('(empty)')}
                        className={`p-2 rounded-md cursor-pointer flex justify-between items-center ${selectedAfiliacion === '(empty)' ? 'bg-ciec-blue' : 'hover:bg-ciec-border'}`}
                    >
                        <span>(blank)</span>
                        <span className="text-xs bg-gray-500 text-white rounded-full px-2 py-0.5">{afiliacionCounts['(empty)'] || 0}</span>
                    </li>
                    {afiliaciones.map(af => (
                        <li key={af.id}
                            onClick={() => setSelectedAfiliacion(af.id)}
                            className={`p-2 rounded-md cursor-pointer flex justify-between items-center ${selectedAfiliacion === af.id ? 'bg-ciec-blue' : 'hover:bg-ciec-border'}`}
                        >
                            <span className="truncate pr-2">{af.nombre_afiliacion}</span>
                            <span className="text-xs bg-gray-500 text-white rounded-full px-2 py-0.5">{afiliacionCounts[af.id] || 0}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex-1 bg-ciec-bg rounded-r-lg p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">{afiliaciones.find(a => a.id === selectedAfiliacion)?.nombre_afiliacion || selectedAfiliacion} <span className="text-sm font-normal text-ciec-text-secondary">{filteredEmpresas.length}</span></h2>
                </div>
                <div className="overflow-y-auto h-[calc(100%-2rem)] pr-2">
                    {filteredEmpresas.map(empresa => (
                         <Link to={`/empresas/editar/${empresa.code}`} key={empresa.code} className="block mb-3">
                            <div className="bg-ciec-card p-4 rounded-lg hover:ring-2 hover:ring-ciec-blue transition-all duration-200 flex items-center space-x-4">
                               <div className="flex-shrink-0 w-12 h-12 bg-ciec-border rounded-lg flex items-center justify-center">
                                    {empresa.logo_url ? (
                                        <img src={empresa.logo_url} alt="logo" className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <Building className="w-6 h-6 text-ciec-text-secondary" />
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <h3 className="font-semibold text-ciec-text-primary">{empresa.nombre_establecimiento || empresa.razon_social}</h3>
                                    <p className="text-sm text-ciec-text-secondary">{empresa.rif || 'Sin RIF'}</p>
                                </div>
                                {!empresa.latitude || !empresa.longitude ? (
                                    <div title="Ubicación no disponible">
                                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                    </div>
                                ) : null}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Empresas;