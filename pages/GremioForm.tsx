import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { InstitucionInsert } from '../types';

const COLORS = ['#4ade80', '#facc15', '#f97316', '#ef4444', '#a855f7', '#3b82f6', '#f8fafc', '#4b5563'];

const GremioForm: React.FC = () => {
    const [nombre, setNombre] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim()) {
            alert('El nombre de la institución es obligatorio.');
            return;
        }

        setSubmitting(true);

        const newGremio: InstitucionInsert = {
            nombre_institucion: nombre.trim(),
            color: selectedColor
        };

        const { error } = await supabase
            .from('instituciones')
            .insert(newGremio);
        
        if (error) {
            console.error('Error creating guild:', error);
            alert(`Error al crear el gremio: ${error.message}`);
        } else {
            alert('Gremio creado exitosamente.');
            navigate('/gremios');
        }
        setSubmitting(false);
    };

    return (
        <div className="max-w-2xl mx-auto bg-ciec-card p-8 rounded-lg">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Añadir Gremio</h1>
                 <button onClick={() => navigate(-1)} className="text-ciec-text-secondary hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="institucion" className="block text-sm font-medium text-ciec-text-secondary mb-2">
                        INSTITUCIÓN*
                    </label>
                    <input
                        id="institucion"
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full bg-ciec-bg border border-ciec-border rounded-lg px-4 py-2 text-ciec-text-primary focus:ring-2 focus:ring-ciec-blue focus:outline-none"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-ciec-text-secondary mb-2">
                        COLOR
                    </label>
                    <div className="flex space-x-3">
                        {COLORS.map(color => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => setSelectedColor(color)}
                                className={`w-8 h-8 rounded-full transition-all ${selectedColor === color ? 'ring-2 ring-offset-2 ring-offset-ciec-card ring-ciec-blue' : ''}`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                </div>
                 <div className="flex justify-end space-x-4 pt-4">
                    <button type="button" onClick={() => navigate('/gremios')} className="bg-ciec-border text-ciec-text-primary font-bold py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={submitting} className="bg-ciec-blue hover:bg-ciec-blue-hover text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-500 transition-colors">
                        {submitting ? 'Guardando...' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GremioForm;