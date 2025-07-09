import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { IntegranteInsert, Establecimiento } from '../types';

const IntegranteForm: React.FC = () => {
    const [formData, setFormData] = useState<Partial<IntegranteInsert>>({});
    const [establecimientos, setEstablecimientos] = useState<{id_establecimiento: number, nombre_establecimiento: string}[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEstablecimientos = async () => {
            const { data, error } = await supabase
                .from('establecimientos')
                .select('id_establecimiento, nombre_establecimiento')
                .order('nombre_establecimiento');
            if (error) console.error("Error fetching establecimientos", error);
            else setEstablecimientos(data || []);
        }
        fetchEstablecimientos();
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const processedValue = name === 'id_establecimiento' ? parseInt(value, 10) : value;
        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nombre_persona || !formData.id_establecimiento) {
            alert('Nombre y Establecimiento son obligatorios.');
            return;
        }
        setSubmitting(true);
        const { error } = await supabase.from('integrantes').insert(formData as IntegranteInsert);
        if (error) {
            alert(`Error: ${error.message}`);
        } else {
            alert('Integrante guardado.');
            navigate('/integrantes');
        }
        setSubmitting(false);
    };

    return (
        <div className="max-w-3xl mx-auto bg-ciec-card p-8 rounded-lg">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Formulario de Integrante</h1>
                <button onClick={() => navigate(-1)} className="text-ciec-text-secondary hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-ciec-text-secondary mb-1">Nombre Completo*</label>
                        <input name="nombre_persona" onChange={handleChange} className="w-full bg-ciec-bg border border-ciec-border rounded-lg px-3 py-2" required/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-ciec-text-secondary mb-1">E-mail</label>
                        <input name="email" type="email" onChange={handleChange} className="w-full bg-ciec-bg border border-ciec-border rounded-lg px-3 py-2"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-ciec-text-secondary mb-1">Cargo</label>
                        <input name="cargo" onChange={handleChange} className="w-full bg-ciec-bg border border-ciec-border rounded-lg px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-ciec-text-secondary mb-1">Teléfono</label>
                        <input name="telefono" type="tel" onChange={handleChange} className="w-full bg-ciec-bg border border-ciec-border rounded-lg px-3 py-2" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-ciec-text-secondary mb-1">Establecimiento*</label>
                        <select name="id_establecimiento" onChange={handleChange} className="w-full bg-ciec-bg border border-ciec-border rounded-lg px-3 py-2" required>
                            <option value="">Seleccione un establecimiento</option>
                            {establecimientos.map(est => (
                                <option key={est.id_establecimiento} value={est.id_establecimiento}>{est.nombre_establecimiento}</option>
                            ))}
                        </select>
                    </div>
                </div>
                 <div className="flex justify-end space-x-4 pt-6">
                    <button type="button" onClick={() => navigate(-1)} className="bg-ciec-border text-ciec-text-primary font-bold py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" disabled={submitting} className="bg-ciec-blue hover:bg-ciec-blue-hover text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-500 transition-colors">
                        {submitting ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default IntegranteForm;