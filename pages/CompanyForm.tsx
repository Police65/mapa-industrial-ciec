import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Company, Estado, Municipio, Parroquia, Afiliacion, ClassCaev, CaevGrupo, CaevDivision } from '../types';
import Spinner from '../components/Spinner';
import { PlusIcon, MinusIcon } from '../components/icons/NavIcons';

type FormData = Partial<Company>;

const CompanyForm: React.FC = () => {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();
    const isEditing = Boolean(code);

    const [formData, setFormData] = useState<FormData>({});
    const [telefonos, setTelefonos] = useState<string[]>(['']);
    const [zonaIndustrial, setZonaIndustrial] = useState('');

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Dropdown data states
    const [estados, setEstados] = useState<Estado[]>([]);
    const [municipios, setMunicipios] = useState<Municipio[]>([]);
    const [parroquias, setParroquias] = useState<Parroquia[]>([]);
    const [afiliaciones, setAfiliaciones] = useState<Afiliacion[]>([]);
    
    // CAEV states
    const [caevGrupos, setCaevGrupos] = useState<CaevGrupo[]>([]);
    const [caevDivisiones, setCaevDivisiones] = useState<CaevDivision[]>([]);
    const [caevClasses, setCaevClasses] = useState<ClassCaev[]>([]);
    const [selectedGrupo, setSelectedGrupo] = useState('');
    const [selectedDivision, setSelectedDivision] = useState('');

    const fetchDropdownData = useCallback(async () => {
        // Using Promise.all to fetch data in parallel for efficiency
        const [
            { data: estadosData, error: e1 },
            { data: municipiosData, error: e2 },
            { data: parroquiasData, error: e3 },
            { data: afiliacionesData, error: e4 },
            { data: caevClassesData, error: e5 },
            { data: caevGruposData, error: e6 },
            { data: caevDivisionesData, error: e7 },
        ] = await Promise.all([
            supabase.from('estados').select('*'),
            supabase.from('municipios').select('*'),
            supabase.from('parroquias').select('*'),
            supabase.from('afiliaciones').select('*'),
            supabase.from('class_caev_clasificaciones').select('*'),
            supabase.from('caev_grupos').select('*'), // Assumed table name
            supabase.from('caev_divisiones').select('*'), // Assumed table name
        ]);

        if (e1 || e2 || e3 || e4 || e5 || e6 || e7) {
            setError("Failed to load form metadata.");
            console.error({ e1, e2, e3, e4, e5, e6, e7 });
        } else {
            setEstados(estadosData || []);
            setMunicipios(municipiosData || []);
            setParroquias(parroquiasData || []);
            setAfiliaciones(afiliacionesData || []);
            setCaevClasses(caevClassesData || []);
            setCaevGrupos(caevGruposData || []);
            setCaevDivisiones(caevDivisionesData || []);
        }
    }, []);
    
    useEffect(() => {
        const initialize = async () => {
            setLoading(true);
            await fetchDropdownData();
            if (isEditing && code) {
                const { data, error: fetchError } = await supabase.from('empresas').select('*').eq('code', code).single();
                if (fetchError) {
                    setError('Could not fetch company data.');
                    console.error(fetchError);
                } else if (data) {
                    setFormData(data);
                    const tels = [data.telefono, data.telefono2].filter(Boolean) as string[];
                    setTelefonos(tels.length > 0 ? tels : ['']);

                    // Pre-fill CAEV dropdowns
                    const initialClase = (await supabase.from('class_caev_clasificaciones').select('*').eq('id', data.class_caev_id).single()).data;
                    if (initialClase) {
                        const initialDivision = (await supabase.from('caev_divisiones').select('*').eq('id', initialClase.div_caev_id).single()).data;
                        if(initialDivision) {
                            setSelectedGrupo(initialDivision.grupo_caev_id);
                            setSelectedDivision(initialDivision.id);
                        }
                    }
                }
            }
            setLoading(false);
        };
        initialize();
    }, [code, isEditing, fetchDropdownData]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        let processedValue: string | number | null = value;
        if (e.target.type === 'number') {
            processedValue = value === '' ? null : Number(value);
        }

        setFormData(prev => ({ ...prev, [name]: processedValue }));

        // Reset dependent fields on change
        if (name === 'estado_id') {
            setFormData(prev => ({...prev, municipio_id: null, parroquia_id: null}));
        }
        if (name === 'municipio_id') {
            setFormData(prev => ({...prev, parroquia_id: null}));
        }
    };

    const handleTelefonoChange = (index: number, value: string) => {
        const newTelefonos = [...telefonos];
        newTelefonos[index] = value;
        setTelefonos(newTelefonos);
    };

    const handleAddTelefono = () => {
        if (telefonos.length < 5) setTelefonos([...telefonos, '']);
    };

    const handleRemoveTelefono = (index: number) => {
        setTelefonos(telefonos.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.razon_social || !formData.code) {
            alert('El Código y la Razón Social son campos obligatorios.');
            return;
        }

        setSubmitting(true);
        setError(null);
        
        const dataToSave = { ...formData };
        
        // Clean and map phone numbers
        const cleanTelefonos = telefonos.map(t => t.trim()).filter(Boolean);
        dataToSave.telefono = cleanTelefonos[0] || null;
        dataToSave.telefono2 = cleanTelefonos[1] || null;
        // NOTE: zonaIndustrial is not saved as there is no corresponding field in the database schema.
        
        // Remove empty strings and convert to null for DB
        const cleanDataToSave = Object.fromEntries(
            Object.entries(dataToSave).map(([key, value]) => [key, value === '' ? null : value])
        );

        const { error: submitError } = isEditing
            ? await supabase.from('empresas').update(cleanDataToSave).eq('code', code)
            : await supabase.from('empresas').insert([cleanDataToSave]);

        if (submitError) {
            setError(`Error al guardar: ${submitError.message}`);
            console.error(submitError);
        } else {
            alert(`Empresa ${isEditing ? 'actualizada' : 'creada'} exitosamente.`);
            navigate('/companies');
        }
        setSubmitting(false);
    };

    if (loading) return <Spinner size="lg" />;
    
    const filteredMunicipios = formData.estado_id ? municipios.filter(m => m.estado_id === Number(formData.estado_id)) : [];
    const filteredParroquias = formData.municipio_id ? parroquias.filter(p => p.municipio_id === Number(formData.municipio_id)) : [];
    const filteredCaevDivisiones = selectedGrupo ? caevDivisiones.filter(d => d.grupo_caev_id === selectedGrupo) : [];
    const filteredCaevClasses = selectedDivision ? caevClasses.filter(c => c.div_caev_id === selectedDivision) : [];

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 md:p-8 rounded-xl shadow-md">
            <h1 className="text-3xl font-bold text-ciec-text">{isEditing ? 'Editar Empresa' : 'Registrar Nueva Empresa'}</h1>
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
            
            <fieldset className="border border-gray-200 p-4 rounded-lg">
                <legend className="text-lg font-semibold text-ciec-blue px-2">Datos Fiscales y de Identificación</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                    <InputField label="Código de Empresa" name="code" value={formData.code} onChange={handleChange} required readOnly={isEditing} />
                    <InputField label="RIF" name="rif" value={formData.rif} onChange={handleChange} required pattern="^[JVEGPCjvegpc]-\d{8}-\d$" title="Formato: J-12345678-9" />
                    <InputField label="Razón Social" name="razon_social" value={formData.razon_social} onChange={handleChange} required />
                    <InputField label="Nombre del Establecimiento" name="nombre_establecimiento" value={formData.nombre_establecimiento} onChange={handleChange} />
                </div>
            </fieldset>

            <fieldset className="border border-gray-200 p-4 rounded-lg">
                <legend className="text-lg font-semibold text-ciec-blue px-2">Información de Contacto</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <InputField label="Persona de Contacto" name="persona_contacto" value={formData.persona_contacto} onChange={handleChange} />
                    <InputField label="E-mail" name="email" type="email" value={formData.email} onChange={handleChange} />
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-ciec-dark-gray">Teléfonos</label>
                        {telefonos.map((tel, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input type="tel" value={tel} onChange={(e) => handleTelefonoChange(index, e.target.value)} className="input-field flex-grow" />
                                {index > 0 && <button type="button" onClick={() => handleRemoveTelefono(index)} className="p-1 text-red-500 hover:text-red-700"><MinusIcon className="w-5 h-5"/></button>}
                            </div>
                        ))}
                        {telefonos.length < 5 && <button type="button" onClick={handleAddTelefono} className="text-sm text-ciec-blue hover:text-ciec-gold font-medium flex items-center gap-1"><PlusIcon className="w-4 h-4" /> Añadir otro teléfono</button>}
                    </div>
                </div>
            </fieldset>

             <fieldset className="border border-gray-200 p-4 rounded-lg">
                <legend className="text-lg font-semibold text-ciec-blue px-2">Ubicación Geográfica</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                    <SelectField label="Estado" name="estado_id" value={formData.estado_id} onChange={handleChange} options={estados.map(e => ({id: e.id, name: e.nombre_estado}))} />
                    <SelectField label="Municipio" name="municipio_id" value={formData.municipio_id} onChange={handleChange} options={filteredMunicipios.map(m => ({id: m.id, name: m.nombre_municipio}))} disabled={!formData.estado_id} />
                    <SelectField label="Parroquia" name="parroquia_id" value={formData.parroquia_id} onChange={handleChange} options={filteredParroquias.map(p => ({id: p.id, name: p.nombre_parroquia}))} disabled={!formData.municipio_id} />
                    <InputField label="Zona Industrial" name="zona_industrial" value={zonaIndustrial} onChange={(e) => setZonaIndustrial(e.target.value)} />
                    <div className="lg:col-span-2"><InputField label="Dirección Fiscal" name="direccion_fiscal" value={formData.direccion_fiscal} onChange={handleChange} /></div>
                    <div className="lg:col-span-2"><InputField label="Dirección Establecimiento" name="direccion_establecimiento" value={formData.direccion_establecimiento} onChange={handleChange} /></div>
                    <InputField label="Latitud" name="latitude" type="number" value={formData.latitude} onChange={handleChange} />
                    <InputField label="Longitud" name="longitude" type="number" value={formData.longitude} onChange={handleChange} />
                </div>
            </fieldset>
            
            <fieldset className="border border-gray-200 p-4 rounded-lg">
                <legend className="text-lg font-semibold text-ciec-blue px-2">Clasificación y Detalles del Negocio</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                    <SelectField label="Afiliada a" name="afiliacion_id" value={formData.afiliacion_id} onChange={handleChange} options={afiliaciones.map(a => ({id: a.id, name: a.nombre_afiliacion}))} />
                    <SelectField label="Grupo CAEV" name="grupo_caev" value={selectedGrupo} onChange={e => { setSelectedGrupo(e.target.value); setSelectedDivision(''); setFormData(p => ({...p, class_caev_id: null})); }} options={caevGrupos.map(g => ({id: g.id, name: g.descripcion}))} />
                    <SelectField label="División CAEV" name="division_caev" value={selectedDivision} onChange={e => { setSelectedDivision(e.target.value); setFormData(p => ({...p, class_caev_id: null}));}} options={filteredCaevDivisiones.map(d => ({id: d.id, name: d.descripcion}))} disabled={!selectedGrupo} />
                    <SelectField label="Clase CAEV" name="class_caev_id" value={formData.class_caev_id} onChange={handleChange} options={filteredCaevClasses.map(c => ({id: c.id, name: c.descripcion_class}))} disabled={!selectedDivision} />
                    <div className="md:col-span-2 lg:col-span-3">
                        <label htmlFor="productos_y_marcas" className="label-field">Productos y Marcas</label>
                        <textarea id="productos_y_marcas" name="productos_y_marcas" value={formData.productos_y_marcas || ''} onChange={handleChange} className="input-field" rows={3}></textarea>
                    </div>
                    <InputField label="Año de Fundación" name="anio_fundacion" type="number" value={formData.anio_fundacion} onChange={handleChange} />
                </div>
            </fieldset>

            <fieldset className="border border-gray-200 p-4 rounded-lg">
                <legend className="text-lg font-semibold text-ciec-blue px-2">Capital Humano</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                     <InputField label="Nº de Obreros" name="obreros" type="number" value={formData.obreros} onChange={handleChange} />
                     <InputField label="Nº de Empleados" name="empleados" type="number" value={formData.empleados} onChange={handleChange} />
                     <InputField label="Nº de Directivos" name="directivos" type="number" value={formData.directivos} onChange={handleChange} />
                </div>
            </fieldset>
            
            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={() => navigate(-1)} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">
                    Cancelar
                </button>
                <button type="submit" disabled={submitting} className="bg-ciec-blue hover:bg-ciec-gold text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400 transition-colors">
                    {submitting ? <Spinner size="sm" color="border-white" /> : (isEditing ? 'Guardar Cambios' : 'Crear Empresa')}
                </button>
            </div>
        </form>
    );
};

// Helper components for form fields for cleaner code
const InputField = ({ label, name, type = 'text', value, onChange, required = false, readOnly = false, pattern = undefined, title = undefined }) => (
    <div>
        <label htmlFor={name} className="label-field">{label}{required && '*'}</label>
        <input
            type={type}
            id={name}
            name={name}
            value={value || ''}
            onChange={onChange}
            required={required}
            readOnly={readOnly}
            pattern={pattern}
            title={title}
            className="input-field"
        />
    </div>
);

const SelectField = ({ label, name, value, onChange, options, disabled = false, required = false }) => (
    <div>
        <label htmlFor={name} className="label-field">{label}{required && '*'}</label>
        <select
            id={name}
            name={name}
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className="input-field"
        >
            <option value="">Seleccione una opción</option>
            {options.map(option => (
                <option key={option.id} value={option.id}>{option.name}</option>
            ))}
        </select>
    </div>
);

// Add some shared styles to index.html or a global CSS file for these classes to work
const globalStyles = `
  .label-field {
    display: block;
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-weight: 500;
    color: #8a8d93;
  }
  .input-field {
    margin-top: 0.25rem;
    display: block;
    width: 100%;
    padding-left: 0.75rem;
    padding-right: 0.75rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    background-color: white;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
  .input-field:focus {
    outline: 2px solid transparent;
    outline-offset: 2px;
    --tw-ring-color: #003366;
    border-color: #003366;
  }
  .input-field:read-only {
    background-color: #f3f4f6;
    cursor: not-allowed;
  }
  .input-field:disabled {
    background-color: #f3f4f6;
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = globalStyles;
document.head.appendChild(styleSheet);


export default CompanyForm;
