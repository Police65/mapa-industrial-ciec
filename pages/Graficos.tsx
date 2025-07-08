
import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, DonutChart } from 'recharts';
import { supabase } from '../lib/supabase';
import { Empresa, Municipio, Afiliacion, SecCaev } from '../types';
import Spinner from '../components/ui/Spinner';

const COLORS = ['#0ea5e9', '#f97316', '#10b981', '#ef4444', '#8b5cf6', '#eab308', '#ec4899'];

const Graficos: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [municipios, setMunicipios] = useState<Municipio[]>([]);
    const [afiliaciones, setAfiliaciones] = useState<Afiliacion[]>([]);
    const [seccionesCaev, setSeccionesCaev] = useState<SecCaev[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [
                { data: empresasData, error: e1 },
                { data: municipiosData, error: e2 },
                { data: afiliacionesData, error: e3 },
                { data: seccionesCaevData, error: e4 },
            ] = await Promise.all([
                supabase.from('empresas').select('*'),
                supabase.from('municipios').select('*'),
                supabase.from('afiliaciones').select('*'),
                supabase.from('sec_caev_clasificaciones').select('*'),
            ]);

            if (e1 || e2 || e3 || e4) {
                console.error({ e1, e2, e3, e4 });
            } else {
                setEmpresas(empresasData || []);
                setMunicipios(municipiosData || []);
                setAfiliaciones(afiliacionesData || []);
                setSeccionesCaev(seccionesCaevData || []);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const dataEmpresasPorMunicipio = useMemo(() => {
        const counts = new Map<string, number>();
        empresas.forEach(e => {
            if (e.municipio_id) {
                counts.set(e.municipio_id, (counts.get(e.municipio_id) || 0) + 1);
            }
        });
        return Array.from(counts.entries()).map(([municipioId, value]) => ({
            name: municipios.find(m => m.id === municipioId)?.nombre_municipio || 'Desconocido',
            value,
        })).sort((a,b) => b.value - a.value);
    }, [empresas, municipios]);

    const dataEmpresasPorGremio = useMemo(() => {
        const counts = new Map<string, number>();
        empresas.forEach(e => {
            if (e.afiliacion_id) {
                counts.set(e.afiliacion_id, (counts.get(e.afiliacion_id) || 0) + 1);
            }
        });
         return Array.from(counts.entries()).map(([afiliacionId, value]) => ({
            name: afiliaciones.find(a => a.id === afiliacionId)?.nombre_afiliacion || 'Desconocido',
            value,
        })).sort((a,b) => b.value - a.value);
    }, [empresas, afiliaciones]);

    const dataEmpresasPorSeccionCAEV = useMemo(() => {
        const counts = new Map<string, number>();
        empresas.forEach(e => {
            if (e.sec_caev_id) {
                counts.set(e.sec_caev_id, (counts.get(e.sec_caev_id) || 0) + 1);
            }
        });
        return Array.from(counts.entries()).map(([secId, value]) => ({
            name: seccionesCaev.find(s => s.id === secId)?.descripcion_sec || 'Desconocido',
            value,
        })).sort((a,b) => b.value - a.value);
    }, [empresas, seccionesCaev]);

    const dataEmpleadosPorMunicipio = useMemo(() => {
        const counts = new Map<string, number>();
        empresas.forEach(e => {
            if (e.municipio_id) {
                const totalEmpleados = (e.obreros || 0) + (e.empleados || 0) + (e.directivos || 0);
                counts.set(e.municipio_id, (counts.get(e.municipio_id) || 0) + totalEmpleados);
            }
        });
        return Array.from(counts.entries()).map(([municipioId, value]) => ({
            name: municipios.find(m => m.id === municipioId)?.nombre_municipio || 'Desconocido',
            value,
        })).sort((a,b) => b.value - a.value);
    }, [empresas, municipios]);


    if (loading) return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>;

    const renderChart = (title: string, data: { name: string, value: number }[], type: 'pie' | 'donut' = 'pie') => (
        <div className="bg-ciec-card p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-ciec-text-primary mb-4">{title}</h3>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name" innerRadius={type === 'donut' ? 40 : 0}>
                            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderChart('Empresas por Municipio', dataEmpresasPorMunicipio, 'pie')}
            {renderChart('Empresas por Sección CAEV', dataEmpresasPorSeccionCAEV, 'pie')}
            {renderChart('Empresas por Gremio', dataEmpresasPorGremio, 'donut')}
            {renderChart('Número de empleados por Mcpo.', dataEmpleadosPorMunicipio, 'pie')}
        </div>
    );
};

export default Graficos;
