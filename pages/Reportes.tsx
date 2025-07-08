
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Empresa, Estado, Municipio } from '../types';
import Spinner from '../components/ui/Spinner';
import { Download, Building } from 'lucide-react';

const Reportes: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [estados, setEstados] = useState<Estado[]>([]);
    const [municipios, setMunicipios] = useState<Municipio[]>([]);

    const [selectedEstado, setSelectedEstado] = useState<string>('0');
    const [selectedMunicipios, setSelectedMunicipios] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [
                { data: empresasData },
                { data: estadosData },
                { data: municipiosData },
            ] = await Promise.all([
                supabase.from('empresas').select('*'),
                supabase.from('estados').select('*'),
                supabase.from('municipios').select('*'),
            ]);
            setEmpresas(empresasData || []);
            setEstados(estadosData || []);
            setMunicipios(municipiosData || []);
            setLoading(false);
        };
        fetchData();
    }, []);

    const filteredMunicipios = useMemo(() => {
        if (selectedEstado === '0') return municipios;
        return municipios.filter(m => m.estado_id === selectedEstado);
    }, [municipios, selectedEstado]);

    const filteredEmpresas = useMemo(() => {
        return empresas.filter(e => {
            const estadoMatch = selectedEstado === '0' || e.estado_id === selectedEstado;
            const municipioMatch = selectedMunicipios.length === 0 || (e.municipio_id && selectedMunicipios.includes(e.municipio_id));
            return estadoMatch && municipioMatch;
        });
    }, [empresas, selectedEstado, selectedMunicipios]);

    const handleMunicipioToggle = (municipioId: string) => {
        setSelectedMunicipios(prev => 
            prev.includes(municipioId) 
                ? prev.filter(id => id !== municipioId) 
                : [...prev, municipioId]
        );
    };

    if (loading) return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>;

    return (
        <div className="flex h-full gap-6">
            {/* Filters Panel */}
            <div className="w-1/3 max-w-sm bg-ciec-card p-4 rounded-lg flex flex-col">
                <h2 className="text-xl font-semibold mb-4">Filtros</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-ciec-text-secondary mb-1">Seleccione Estado</label>
                        <select
                            value={selectedEstado}
                            onChange={e => {
                                setSelectedEstado(e.target.value);
                                setSelectedMunicipios([]);
                            }}
                            className="w-full bg-ciec-bg border border-ciec-border rounded-lg px-3 py-2"
                        >
                            <option value="0">Todos los Estados</option>
                            {estados.map(e => <option key={e.id} value={e.id}>{e.nombre_estado}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-ciec-text-secondary mb-1">Seleccione Municipio</label>
                        <div className="max-h-60 overflow-y-auto p-2 bg-ciec-bg rounded-lg border border-ciec-border">
                            {filteredMunicipios.map(m => (
                                <div key={m.id} className="flex items-center">
                                    <input type="checkbox" id={`mun-${m.id}`} checked={selectedMunicipios.includes(m.id)} onChange={() => handleMunicipioToggle(m.id)} className="w-4 h-4 text-ciec-blue bg-gray-700 border-gray-600 rounded focus:ring-ciec-blue"/>
                                    <label htmlFor={`mun-${m.id}`} className="ml-2 text-sm">{m.nombre_municipio}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Panel */}
            <div className="flex-1 bg-ciec-card p-4 rounded-lg flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Resultado <span className="text-base font-normal text-ciec-text-secondary">{filteredEmpresas.length}</span></h2>
                    <button className="flex items-center bg-ciec-blue hover:bg-ciec-blue-hover text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        <Download className="w-5 h-5 mr-2" /> Exportar
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                     <table className="w-full text-sm text-left text-ciec-text-secondary">
                        <thead className="text-xs text-ciec-text-primary uppercase bg-ciec-bg">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nombre Establecimiento</th>
                                <th scope="col" className="px-6 py-3">Rif</th>
                                <th scope="col" className="px-6 py-3">Logo</th>
                                <th scope="col" className="px-6 py-3">Razón Social</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmpresas.map(e => (
                                <tr key={e.code} className="border-b border-ciec-border hover:bg-ciec-bg">
                                    <td className="px-6 py-4 font-medium text-ciec-text-primary whitespace-nowrap">{e.nombre_establecimiento || 'N/A'}</td>
                                    <td className="px-6 py-4">{e.rif}</td>
                                    <td className="px-6 py-4">
                                        <div className="w-10 h-10 bg-ciec-border rounded-md flex items-center justify-center">
                                            {e.logo_url ? <img src={e.logo_url} className="w-full h-full object-cover rounded-md"/> : <Building className="w-5 h-5"/>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{e.razon_social}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reportes;
