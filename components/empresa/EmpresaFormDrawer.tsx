
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { EmpresaInsert, Estado, Municipio, Parroquia, Afiliacion, SecCaev, DivCaev, ClassCaev } from '../../types';
import Spinner from '../ui/Spinner';
import EmpresaFormFields from './EmpresaFormFields';
import { Save, X } from 'lucide-react';
import { useDraft } from '../../contexts/DraftContext';

const EmpresaFormDrawer: React.FC = () => {
    const {
        draft,
        isDrawerOpen,
        isSubmitting,
        isDirty,
        closeDrawer,
        updateDraft,
        setTelefonos,
        setLogo,
        saveDraft,
        discardDraft,
    } = useDraft();

    const { formData, telefonos, logoPreview } = draft;

    const [error, setError] = useState<string | null>(null);
    const [loadingDropdowns, setLoadingDropdowns] = useState(true);
    
    // Dropdown data
    const [estados, setEstados] = useState<Estado[]>([]);
    const [municipios, setMunicipios] = useState<Municipio[]>([]);
    const [parroquias, setParroquias] = useState<Parroquia[]>([]);
    const [afiliaciones, setAfiliaciones] = useState<Afiliacion[]>([]);
    const [secCaev, setSecCaev] = useState<SecCaev[]>([]);
    const [divCaev, setDivCaev] = useState<DivCaev[]>([]);
    const [classCaev, setClassCaev] = useState<ClassCaev[]>([]);

    useEffect(() => {
        const fetchDropdownData = async () => {
            setLoadingDropdowns(true);
            const [
               { data: e, error: e1 }, { data: m, error: e2 }, { data: p, error: e3 },
               { data: a, error: e4 }, { data: s, error: e5 }, { data: d, error: e6 }, { data: c, error: e7 }
           ] = await Promise.all([
               supabase.from('estados').select('*'), supabase.from('municipios').select('*'),
               supabase.from('parroquias').select('*'), supabase.from('afiliaciones').select('*'),
               supabase.from('sec_caev_clasificaciones').select('*'), supabase.from('div_caev_clasificaciones').select('*'),
               supabase.from('class_caev_clasificaciones').select('*'),
           ]);
           if (e1 || e2 || e3 || e4 || e5 || e6 || e7) setError("Failed to load form metadata.");
           else {
               setEstados(e || []); setMunicipios(m || []); setParroquias(p || []);
               setAfiliaciones(a || []); setSecCaev(s || []); setDivCaev(d || []); setClassCaev(c || []);
           }
           setLoadingDropdowns(false);
       };
       fetchDropdownData();
    }, [])
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        let processedValue: string | number | null = value;
        if (e.target.type === 'number') processedValue = value === '' ? null : Number(value);
        
        const updates: Partial<EmpresaInsert> = { [name]: processedValue };

        if (name === 'estado_id') { updates.municipio_id = null; updates.parroquia_id = null; }
        if (name === 'municipio_id') updates.parroquia_id = null;
        if (name === 'sec_caev_id') { updates.div_caev_id = null; updates.class_caev_id = null; }
        if (name === 'div_caev_id') updates.class_caev_id = null;

        updateDraft(updates);
    };
    
    const handleCoordinatesPaste = (lat: number, lon: number) => {
        updateDraft({ latitude: lat, longitude: lon });
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => setLogo(file, reader.result as string);
            reader.readAsDataURL(file);
        }
    };
    
    const handleClearLogo = () => {
        setLogo(null, null);
    };

    const handleTelefonoChange = (index: number, value: string) => {
        const newTelefonos = [...telefonos];
        newTelefonos[index] = value;
        setTelefonos(newTelefonos);
    };
    const handleAddTelefono = () => telefonos.length < 2 && setTelefonos([...telefonos, '']);
    const handleRemoveTelefono = (index: number) => setTelefonos(telefonos.filter((_, i) => i !== index));

    const handleSubmit = async () => {
        setError(null);
        const result = await saveDraft();
        if (!result.success) {
            setError(result.error || 'Ocurrió un error desconocido.');
        }
    };
    
    const handleCancelClick = () => {
        if (isDirty) {
            discardDraft();
        }
    };

    const handleMinimizeDrawer = () => {
        closeDrawer();
    };

    const filteredMunicipios = formData.estado_id ? municipios.filter(m => m.estado_id === formData.estado_id) : [];
    const filteredParroquias = formData.municipio_id ? parroquias.filter(p => p.municipio_id === formData.municipio_id) : [];
    const filteredDivCaev = formData.sec_caev_id ? divCaev.filter(d => d.sec_caev_id === formData.sec_caev_id) : [];
    const filteredClassCaev = formData.div_caev_id ? classCaev.filter(c => c.div_caev_id === formData.div_caev_id) : [];

    const drawerClasses = `fixed top-0 right-0 h-full bg-ciec-card shadow-2xl transition-transform duration-300 ease-in-out z-40 flex flex-col`;
    
    return (
        <>
            <div className={`${drawerClasses} ${!isDrawerOpen ? 'translate-x-full' : 'translate-x-0 w-full max-w-3xl'}`}>
                {/* Sticky Header */}
                <header className="flex-shrink-0 bg-ciec-bg p-4 flex justify-between items-center border-b border-ciec-border sticky top-0 z-10">
                    <h2 className="text-xl font-bold">Añadir Nueva Empresa</h2>
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={handleCancelClick} 
                            disabled={!isDirty || isSubmitting}
                            className="bg-ciec-border text-ciec-text-primary font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            Cancelar
                        </button>
                        <button onClick={handleSubmit} disabled={isSubmitting || loadingDropdowns} className="bg-ciec-blue hover:bg-ciec-blue-hover text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500 transition-colors flex items-center">
                            {isSubmitting ? <Spinner size="sm" color="border-white" /> : <><Save className="w-5 h-5 mr-2" /> Crear Empresa</>}
                        </button>
                         <button onClick={handleMinimizeDrawer} className="p-2 rounded-full text-ciec-text-secondary hover:bg-ciec-border">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </header>
                
                {/* Scrollable Form Content */}
                <div className="flex-1 overflow-y-auto">
                    {loadingDropdowns ? <div className="h-full flex items-center justify-center"><Spinner size="lg" /></div> : (
                        <div className="p-6 space-y-8">
                             {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
                            <EmpresaFormFields
                                isEditing={false}
                                formData={formData}
                                handleChange={handleChange}
                                handleCoordinatesPaste={handleCoordinatesPaste}
                                telefonos={telefonos}
                                handleTelefonoChange={handleTelefonoChange}
                                handleAddTelefono={handleAddTelefono}
                                handleRemoveTelefono={handleRemoveTelefono}
                                logoPreview={logoPreview}
                                handleLogoChange={handleLogoChange}
                                handleClearLogo={handleClearLogo}
                                dropdowns={{
                                    estados,
                                    municipios,
                                    parroquias,
                                    afiliaciones,
                                    secCaev,
                                    divCaev,
                                    classCaev
                                }}
                                filteredDropdowns={{
                                    filteredMunicipios,
                                    filteredParroquias,
                                    filteredDivCaev,
                                    filteredClassCaev
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
            {/* Overlay */}
            {isDrawerOpen && <div onClick={handleMinimizeDrawer} className="fixed inset-0 bg-black/50 z-20 transition-opacity duration-300"></div>}
        </>
    );
};

export default EmpresaFormDrawer;