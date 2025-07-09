import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';
import { EstablecimientoFull, Municipio, Institucion, SeccionCaev } from '../types';
import Spinner from '../components/ui/Spinner';

const COLORS = ['#0ea5e9', '#f97316', '#10b981', '#ef4444', '#8b5cf6', '#eab308', '#ec4899'];

const Graficos: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [establecimientos, setEstablecimientos] = useState<EstablecimientoFull[]>([]);
    const [instituciones, setInstituciones] = useState<Institucion[]>([]);
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [
                { data: estData, error: e1 },
                { data: instData, error: e2 },
            ] = await Promise.all([
                supabase.from('establecimientos').select(`
                    personal_obrero, personal_empleado, personal_directivo,
                    direcciones ( parroquias ( municipios ( nombre_municipio ) ) ),
                    afiliaciones ( rif_institucion ),
                    clases_caev ( divisiones_caev ( secciones_caev ( id_seccion, nombre_seccion ) ) )
                `),
                supabase.from('instituciones').select('rif, nombre'),
            ]);

            if (e1 || e2) {
                console.error({ e1, e2 });
            } else {
                setEstablecimientos(estData as any || []);
                setInstituciones(instData || []);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const dataEstablecimientosPorMunicipio = useMemo(() => {
        const counts = new Map<string, number>();
        establecimientos.forEach(e => {
            const municipio = e.direcciones?.parroquias?.municipios?.nombre_municipio;
            if (municipio) {
                counts.set(municipio, (counts.get(municipio) || 0) + 1);
            }
        });
        return Array.from(counts.entries()).map(([name, value]) => ({ name, value }))
            .sort((a,b) => b.value - a.value);
    }, [establecimientos]);

    const dataEstablecimientosPorGremio = useMemo(() => {
        const counts = new Map<string, number>();
        establecimientos.forEach(e => {
            e.afiliaciones?.forEach(af => {
                 counts.set(af.rif_institucion, (counts.get(af.rif_institucion) || 0) + 1);
            })
        });
         return Array.from(counts.entries()).map(([institucionRif, value]) => ({
            name: instituciones.find(i => i.rif === institucionRif)?.nombre || 'Desconocido',
            value,
        })).sort((a,b) => b.value - a.value);
    }, [establecimientos, instituciones]);

    const dataEstablecimientosPorSeccionCAEV = useMemo(() => {
        const counts = new Map<string, number>();
        establecimientos.forEach(e => {
            const seccion = e.clases_caev?.divisiones_caev?.secciones_caev?.nombre_seccion;
            if (seccion) {
                counts.set(seccion, (counts.get(seccion) || 0) + 1);
            }
        });
        return Array.from(counts.entries()).map(([name, value]) => ({ name, value, }))
            .sort((a,b) => b.value - a.value);
    }, [establecimientos]);

    const dataEmpleadosPorMunicipio = useMemo(() => {
        const counts = new Map<string, number>();
        establecimientos.forEach(e => {
             const municipio = e.direcciones?.parroquias?.municipios?.nombre_municipio;
            if (municipio) {
                const totalEmpleados = (e.personal_obrero || 0) + (e.personal_empleado || 0) + (e.personal_directivo || 0);
                counts.set(municipio, (counts.get(municipio) || 0) + totalEmpleados);
            }
        });
        return Array.from(counts.entries()).map(([name, value]) => ({ name, value, }))
            .sort((a,b) => b.value - a.value);
    }, [establecimientos]);


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
            {renderChart('Establecimientos por Municipio', dataEstablecimientosPorMunicipio, 'pie')}
            {renderChart('Establecimientos por Sección CAEV', dataEstablecimientosPorSeccionCAEV, 'pie')}
            {renderChart('Establecimientos por Gremio', dataEstablecimientosPorGremio, 'donut')}
            {renderChart('Número de empleados por Mcpo.', dataEmpleadosPorMunicipio, 'pie')}
        </div>
    );
};

export default Graficos;