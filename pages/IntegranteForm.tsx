
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Integrante } from '../types';

const IntegranteForm: React.FC = () => {
    const [formData, setFormData] = useState<Partial<Integrante>>({});
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nombre || !formData.email) {
            alert('Nombre y E-mail son obligatorios.');
            return;
        }
        setSubmitting(true);
        const { error } = await supabase.from('integrantes').insert(formData as any); // Cast to any to match Insert type
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
                <h1 className="text-2xl font-bold">Integrante Form</h1>
                <button onClick={() => navigate(-1)} className="text-ciec-text-secondary hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-ciec-text-secondary mb-1">Nombre</label>
                        <input name="nombre" onChange={handleChange} className="w-full bg-ciec-bg border border-ciec-border rounded-lg px-3 py-2" required/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-ciec-text-secondary mb-1">E-mail</label>
                        <input name="email" type="email" onChange={handleChange} className="w-full bg-ciec-bg border border-ciec-border rounded-lg px-3 py-2" required/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-ciec-text-secondary mb-1">Cargo</label>
                        <input name="cargo" onChange={handleChange} className="w-full bg-ciec-bg border border-ciec-border rounded-lg px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-ciec-text-secondary mb-1">Teléfono</label>
                        <input name="telefono" type="tel" onChange={handleChange} className="w-full bg-ciec-bg border border-ciec-border rounded-lg px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-ciec-text-secondary mb-1">Empresa</label>
                        <input name="empresa" onChange={handleChange} className="w-full bg-ciec-bg border border-ciec-border rounded-lg px-3 py-2" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-ciec-text-secondary mb-1">Area de interes</label>
                        <input name="area_interes" onChange={handleChange} className="w-full bg-ciec-bg border border-ciec-border rounded-lg px-3 py-2" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-ciec-text-secondary mb-1">Comisión</label>
                        <input name="comision" onChange={handleChange} className="w-full bg-ciec-bg border border-ciec-border rounded-lg px-3 py-2" />
                    </div>
                </div>
                 <div className="flex justify-end space-x-4 pt-6">
                    <button type="button" onClick={() => navigate(-1)} className="bg-ciec-border text-ciec-text-primary font-bold py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={submitting} className="bg-ciec-blue hover:bg-ciec-blue-hover text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-500 transition-colors">
                        {submitting ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default IntegranteForm;
