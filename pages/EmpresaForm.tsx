import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { EmpresaInsert, Estado, Municipio, Parroquia, Afiliacion, SecCaev, DivCaev, ClassCaev, Empresa } from '../types';
import Spinner from '../components/ui/Spinner';
import EmpresaFormFields from '../components/empresa/EmpresaFormFields';

const EmpresaForm: React.FC = () => {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();
    const isEditing = true; // This form is now only for editing

    const [formData, setFormData] = useState<Partial<Empresa>>({});
    const [telefonos, setTelefonos] = useState<string[]>(['']);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
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
        };

        const initialize = async () => {
            setLoading(true);
            await fetchDropdownData();
            if (code) {
                const { data, error: fetchError } = await supabase.from('empresas').select('*').eq('code', code).single();
                if (fetchError) setError('Could not fetch company data.');
                else if (data) {
                    setFormData(data);
                    setTelefonos([data.telefono, data.telefono2].filter(Boolean) as string[] || ['']);
                    if (data.logo_url) setLogoPreview(data.logo_url);
                }
            }
            setLoading(false);
        };
        initialize();
    }, [code]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.razon_social || !formData.code) {
            alert('Código y Razón Social son obligatorios.');
            return;
        }
        setSubmitting(true);
        setError(null);
        
        const dataToSave: Partial<Empresa> = { ...formData };
        dataToSave.telefono = telefonos[0] || null;
        dataToSave.telefono2 = telefonos[1] || null;

        if (logoFile) {
            const fileName = `${formData.code}-${Date.now()}`;
            // Upsert allows replacing the file if it exists, useful for updates
            const { data: uploadData, error: uploadError } = await supabase.storage.from('logos').upload(fileName, logoFile, { upsert: true });
            if (uploadError) {
                setError(`Error uploading logo: ${uploadError.message}`);
                setSubmitting(false);
                return;
            }
            const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(uploadData.path);
            dataToSave.logo_url = publicUrl;
        } else if (logoPreview === null) {
            dataToSave.logo_url = null;
        }


        const { error: submitError } = await supabase.from('empresas').update(dataToSave).eq('code', code!);

        if (submitError) setError(`Error al guardar: ${submitError.message}`);
        else {
            alert(`Empresa actualizada exitosamente.`);
            navigate('/empresas');
        }
        setSubmitting(false);
    };

    if (loading) return <div className="h-full flex items-center justify-center"><Spinner size="lg" /></div>;
    
    const filteredMunicipios = formData.estado_id ? municipios.filter(m => m.estado_id === formData.estado_id) : [];
    const filteredParroquias = formData.municipio_id ? parroquias.filter(p => p.municipio_id === formData.municipio_id) : [];
    const filteredDivCaev = formData.sec_caev_id ? divCaev.filter(d => d.sec_caev_id === formData.sec_caev_id) : [];
    const filteredClassCaev = formData.div_caev_id ? classCaev.filter(c => c.div_caev_id === formData.div_caev_id) : [];

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-ciec-card p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-ciec-text-primary">Editar Empresa</h1>
            {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
            
            <EmpresaFormFields
                isEditing={isEditing}
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
            
            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={() => navigate(-1)} className="bg-ciec-border text-ciec-text-primary font-bold py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors">Cancelar</button>
                <button type="submit" disabled={submitting} className="bg-ciec-blue hover:bg-ciec-blue-hover text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-500 transition-colors">
                    {submitting ? <Spinner size="sm" color="border-white" /> : 'Guardar Cambios'}
                </button>
            </div>
        </form>
    );
};

export default EmpresaForm;