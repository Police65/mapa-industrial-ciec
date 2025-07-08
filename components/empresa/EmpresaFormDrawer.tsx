import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { EmpresaInsert, Estado, Municipio, Parroquia, Afiliacion, SecCaev, DivCaev, ClassCaev } from '../../types';
import Spinner from '../ui/Spinner';
import Modal from '../ui/Modal';
import EmpresaFormFields from './EmpresaFormFields';
import { Plus, ChevronLeft, Save, X } from 'lucide-react';

const INITIAL_STATE: Partial<EmpresaInsert> = {
    code: '',
    razon_social: '',
};

const EmpresaFormDrawer: React.FC = () => {
    const [isMinimized, setIsMinimized] = useState(true);
    const [isCancelModalOpen, setCancelModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<EmpresaInsert>>(INITIAL_STATE);
    const [telefonos, setTelefonos] = useState<string[]>(['']);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
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
            setLoading(true);
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
           setLoading(false);
       };
       fetchDropdownData();
    }, [])

    const isDirty = useMemo(() => {
        if (logoFile) return true;
        if (telefonos.length > 1 || (telefonos.length > 0 && telefonos[0] !== '')) return true;
        
        const keys = new Set([...Object.keys(INITIAL_STATE), ...Object.keys(formData)]);
        for (const key of keys) {
            const initialValue = (INITIAL_STATE as any)[key] ?? '';
            const currentValue = (formData as any)[key] ?? '';
            // Treat null/undefined/empty string as the same for dirty check purposes
            if (initialValue !== currentValue && !(initialValue === '' && currentValue == null) && !(initialValue == null && currentValue === '')) {
                return true;
            }
        }
        return false;
    }, [formData, telefonos, logoFile]);
    

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        let processedValue: string | number | null = value;
        if (e.target.type === 'number') processedValue = value === '' ? null : Number(value);
        
        setFormData(prev => {
            const newState = { ...prev, [name]: processedValue };
            if (name === 'estado_id') { newState.municipio_id = null; newState.parroquia_id = null; }
            if (name === 'municipio_id') newState.parroquia_id = null;
            if (name === 'sec_caev_id') { newState.div_caev_id = null; newState.class_caev_id = null; }
            if (name === 'div_caev_id') newState.class_caev_id = null;
            return newState;
        });
    };
    
    const handleCoordinatesPaste = (lat: number, lon: number) => {
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lon }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setLogoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };
    
    const handleClearLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
        setFormData(prev => ({...prev, logo_url: null}));
    }

    const handleTelefonoChange = (index: number, value: string) => setTelefonos(t => t.map((tel, i) => i === index ? value : tel));
    const handleAddTelefono = () => telefonos.length < 2 && setTelefonos(t => [...t, '']);
    const handleRemoveTelefono = (index: number) => setTelefonos(t => t.filter((_, i) => i !== index));

    const resetForm = () => {
        setFormData(INITIAL_STATE);
        setTelefonos(['']);
        setLogoFile(null);
        setLogoPreview(null);
        setError(null);
    }
    
    const handleMinimizeDrawer = () => {
        setIsMinimized(true);
    };
    
    const handleCancelClick = () => {
        if (isDirty) {
            setCancelModalOpen(true);
        }
    };

    const handleConfirmDiscard = () => {
        setCancelModalOpen(false);
        resetForm();
        setIsMinimized(true);
    };

    const handleSubmit = async () => {
        if (!formData.razon_social || !formData.code) {
            setError('Código y Razón Social son obligatorios.');
            return;
        }
        setSubmitting(true);
        setError(null);
        
        const dataToSave: EmpresaInsert = {
            ...formData,
            code: formData.code!,
            razon_social: formData.razon_social!,
            telefono: telefonos[0] || null,
            telefono2: telefonos[1] || null,
        };
        

        if (logoFile) {
            const fileName = `${formData.code}-${Date.now()}`;
            const { data: uploadData, error: uploadError } = await supabase.storage.from('logos').upload(fileName, logoFile);
            if (uploadError) {
                setError(`Error al subir el logo: ${uploadError.message}`);
                setSubmitting(false);
                return;
            }
            const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(uploadData.path);
            dataToSave.logo_url = publicUrl;
        }

        const { error: submitError } = await supabase.from('empresas').insert(dataToSave);

        if (submitError) setError(`Error al guardar: ${submitError.message}`);
        else {
            alert(`Empresa creada exitosamente.`);
            resetForm();
            setIsMinimized(true);
        }
        setSubmitting(false);
    };

    const filteredMunicipios = formData.estado_id ? municipios.filter(m => m.estado_id === formData.estado_id) : [];
    const filteredParroquias = formData.municipio_id ? parroquias.filter(p => p.municipio_id === formData.municipio_id) : [];
    const filteredDivCaev = formData.sec_caev_id ? divCaev.filter(d => d.sec_caev_id === formData.sec_caev_id) : [];
    const filteredClassCaev = formData.div_caev_id ? classCaev.filter(c => c.div_caev_id === formData.div_caev_id) : [];

    const drawerClasses = `fixed top-0 right-0 h-full bg-ciec-card shadow-2xl transition-transform duration-300 ease-in-out z-40 flex flex-col`;
    
    return (
        <>
            <Modal
                isOpen={isCancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                title="¿Descartar Cambios?"
            >
                <p className="text-ciec-text-secondary">
                    Si cancelas, se perderá toda la información que has introducido. ¿Estás seguro de que quieres continuar?
                </p>
                <div className="mt-6 flex justify-end space-x-4">
                    <button onClick={() => setCancelModalOpen(false)} className="bg-ciec-border text-ciec-text-primary font-bold py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors">
                        Seguir Editando
                    </button>
                    <button onClick={handleConfirmDiscard} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                        Descartar Cambios
                    </button>
                </div>
            </Modal>
            <div className={`${drawerClasses} ${isMinimized ? 'translate-x-full' : 'translate-x-0 w-full max-w-3xl'}`}>
                {/* Sticky Header */}
                <header className="flex-shrink-0 bg-ciec-bg p-4 flex justify-between items-center border-b border-ciec-border sticky top-0 z-10">
                    <h2 className="text-xl font-bold">Añadir Nueva Empresa</h2>
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={handleCancelClick} 
                            disabled={!isDirty}
                            className="bg-ciec-border text-ciec-text-primary font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            Cancelar
                        </button>
                        <button onClick={handleSubmit} disabled={submitting || loading} className="bg-ciec-blue hover:bg-ciec-blue-hover text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500 transition-colors flex items-center">
                            {submitting ? <Spinner size="sm" color="border-white" /> : <><Save className="w-5 h-5 mr-2" /> Crear Empresa</>}
                        </button>
                         <button onClick={handleMinimizeDrawer} className="p-2 rounded-full text-ciec-text-secondary hover:bg-ciec-border">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </header>
                
                {/* Scrollable Form Content */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? <div className="h-full flex items-center justify-center"><Spinner size="lg" /></div> : (
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

            {/* Minimized Tab */}
            <button 
                onClick={() => setIsMinimized(false)}
                className={`fixed right-0 top-1/2 -translate-y-1/2 bg-ciec-blue hover:bg-ciec-blue-hover text-white p-3 rounded-l-lg shadow-lg z-30 transition-transform duration-300 ease-in-out ${!isMinimized ? 'translate-x-full' : 'translate-x-0'}`}
                aria-label="Añadir Empresa"
                title="Añadir Empresa"
            >
                <Plus className="w-6 h-6" />
            </button>

            {/* Overlay */}
            {!isMinimized && <div onClick={handleMinimizeDrawer} className="fixed inset-0 bg-black/50 z-20 transition-opacity duration-300"></div>}
        </>
    );
};

export default EmpresaFormDrawer;