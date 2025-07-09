import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';
import { EstablecimientoFull, Institucion } from '../types';
import Spinner from '../components/ui/Spinner';
import { Maximize } from 'lucide-react';

const COLORS = ['#0ea5e9', '#f97316', '#10b981', '#ef4444', '#8b5cf6', '#eab308', '#ec4899'];

// Componente Modal personalizado para esta vista, con mayor tamaño
const ChartModal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 transition-opacity"
            onClick={onClose}
        >
            <div 
                className="bg-ciec-card rounded-lg shadow-xl w-full max-w-5xl h-[70vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-ciec-border flex-shrink-0">
                    <h2 className="text-2xl font-bold text-ciec-text-primary">{title}</h2>
                    <button onClick={onClose} className="text-ciec-text-secondary hover:text-white p-2 rounded-full hover:bg-ciec-border">
                        <Maximize className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-grow p-4 overflow-hidden">
                    {children}
                </div>
            </div>
        </div>
    );
};


// Componente para la leyenda personalizada en el modal
const CustomLegend = (props: any) => {
    const { payload } = props;
    const total = useMemo(() => {
        return payload.reduce((sum: number, entry: any) => sum + entry.payload.value, 0);
    }, [payload]);

    return (
        <div className="w-full text-sm text-ciec-text-secondary overflow-y-auto max-h-full pr-4">
            <ul className="space-y-3">
                {payload.map((entry: any, index: number) => {
                    const percentage = total > 0 ? ((entry.payload.value / total) * 100).toFixed(1) : 0;
                    return (
                        <li key={`item-${index}`} className="flex justify-between items-center p-2 rounded-md hover:bg-ciec-border">
                            <div className="flex items-center">
                                <span style={{ backgroundColor: entry.color }} className="w-4 h-4 inline-block mr-3 rounded-full flex-shrink-0"></span>
                                <span className="truncate pr-2 font-medium text-ciec-text-primary">{entry.value}</span>
                            </div>
                            <div className="flex-shrink-0">
                                <span className="font-bold text-ciec-text-primary">{entry.payload.value}</span>
                                <span className="ml-2 text-xs text-ciec-text-secondary">({percentage}%)</span>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};


const Graficos: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [establecimientos, setEstablecimientos] = useState<EstablecimientoFull[]>([]);
    const [instituciones, setInstituciones] = useState<Institucion[]>([]);
    const [expandedChart, setExpandedChart] = useState<{ title: string; data: { name: string; value: number }[] } | null>(null);
    
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
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-ciec-text-primary mb-4">{title}</h3>
                <button onClick={() => setExpandedChart({ title, data })} className="text-ciec-text-secondary hover:text-white p-1 rounded-full">
                    <Maximize size={16} />
                </button>
            </div>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name" innerRadius={type === 'donut' ? 40 : 0}>
                            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: '#1f2937', // bg-ciec-card
                                border: '1px solid #374151', // border-ciec-border
                                color: '#f9fafb' // text-ciec-text-primary
                            }}
                            itemStyle={{ color: '#f9fafb' }}
                        />
                        <Legend wrapperStyle={{ color: '#9ca3af', fontSize: '12px' }}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
    
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderChart('Establecimientos por Municipio', dataEstablecimientosPorMunicipio, 'pie')}
                {renderChart('Establecimientos por Sección CAEV', dataEstablecimientosPorSeccionCAEV, 'pie')}
                {renderChart('Establecimientos por Gremio', dataEstablecimientosPorGremio, 'donut')}
                {renderChart('Número de empleados por Mcpo.', dataEmpleadosPorMunicipio, 'pie')}
            </div>

            {expandedChart && (
                <ChartModal isOpen={!!expandedChart} onClose={() => setExpandedChart(null)} title={expandedChart.title}>
                    <div className="w-full h-full flex flex-col md:flex-row items-center p-4">
                         <ResponsiveContainer width="60%" height="100%">
                            <PieChart>
                                <Pie
                                    data={expandedChart.data}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius="85%"
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                >
                                    {expandedChart.data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#1f2937',
                                        border: '1px solid #374151',
                                        color: '#f9fafb'
                                    }}
                                    itemStyle={{ color: '#f9fafb' }}
                                />
                                <Legend 
                                    content={<CustomLegend />}
                                    layout="vertical"
                                    verticalAlign="middle"
                                    align="right"
                                    wrapperStyle={{ width: '40%', paddingLeft: '20px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </ChartModal>
            )}
        </>
    );
};

export default Graficos;


