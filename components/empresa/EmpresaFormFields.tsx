import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Minus, UploadCloud, X } from 'lucide-react';
import { GoogleMap, MarkerF } from '@react-google-maps/api';
import { darkMapStyle } from '../../styles/mapStyles';

const InputField: React.FC<{ label: string; name: string; value?: string | number | null; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; type?: string; required?: boolean; readOnly?: boolean; pattern?: string; title?: string; as?: 'textarea', placeholder?: string, onPaste?: (e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void; }> = ({ label, name, as, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-ciec-text-secondary mb-1">{label}{props.required && '*'}</label>
        {as === 'textarea' ? (
            <textarea id={name} name={name} {...props} value={props.value || ''} className="w-full bg-ciec-bg border border-ciec-border rounded-lg px-3 py-2 text-ciec-text-primary focus:ring-2 focus:ring-ciec-blue focus:outline-none" rows={3}></textarea>
        ) : (
            <input id={name} name={name} {...props} value={props.value || ''} className="w-full bg-ciec-bg border border-ciec-border rounded-lg px-3 py-2 text-ciec-text-primary focus:ring-2 focus:ring-ciec-blue focus:outline-none" />
        )}
    </div>
);

const SelectField: React.FC<{ label: string; name: string; value?: string | number | null; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: { id: string | number; name: string }[]; disabled?: boolean; required?: boolean; }> = ({ label, name, options, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-ciec-text-secondary mb-1">{label}{props.required && '*'}</label>
        <select id={name} name={name} {...props} value={props.value || ''} className="w-full bg-ciec-bg border border-ciec-border rounded-lg px-3 py-2 appearance-none text-ciec-text-primary focus:ring-2 focus:ring-ciec-blue focus:outline-none disabled:opacity-50">
            <option value="">Seleccione una opción</option>
            {options.map(option => (
                <option key={option.id} value={option.id}>{option.name}</option>
            ))}
        </select>
    </div>
);

const Fieldset: React.FC<{legend: string; children: React.ReactNode}> = ({ legend, children }) => (
    <fieldset className="border border-ciec-border p-4 rounded-lg">
        <legend className="text-lg font-semibold text-ciec-blue px-2">{legend}</legend>
        <div className="mt-4">{children}</div>
    </fieldset>
);

// --- TelefonoInput component ---
const phonePrefixes = [
    '0414', '0412', '0416', '0424', '0426', 
    '0212', '0241', '0242', '0245', '0249'
];

interface TelefonoInputProps {
    value: string;
    onChange: (value: string) => void;
}

const TelefonoInput: React.FC<TelefonoInputProps> = ({ value, onChange }) => {
    const [prefix, setPrefix] = useState('0414');
    const [number, setNumber] = useState('');

    // This effect syncs the component's internal state FROM the parent's `value` prop.
    // It runs ONLY when the `value` prop changes.
    useEffect(() => {
        const fullNumber = (value || '').replace(/[^0-9]/g, '');
        let foundPrefix = '0414';
        let restOfNumber = fullNumber;
        
        if (fullNumber) {
            const sortedPrefixes = [...phonePrefixes].sort((a,b) => b.length - a.length);
            for (const p of sortedPrefixes) {
                if (fullNumber.startsWith(p)) {
                    foundPrefix = p;
                    restOfNumber = fullNumber.substring(p.length);
                    break;
                }
            }
        } else {
            // If the prop value is empty, we ensure the number is also empty.
            restOfNumber = '';
        }
        
        setPrefix(foundPrefix);
        setNumber(restOfNumber);
    }, [value]);

    // This function handles changes from the inputs and calls the parent's onChange.
    const triggerChange = (newPrefix: string, newNumber: string) => {
        const cleanNumber = newNumber.replace(/[^0-9]/g, '');
        
        // Update local state for immediate UI feedback.
        setPrefix(newPrefix);
        setNumber(cleanNumber);

        // Calculate the new full value and notify the parent.
        const newFullValue = cleanNumber ? `${newPrefix}${cleanNumber}` : '';
        
        // This check is crucial to prevent loops if the parent component re-renders.
        if (newFullValue !== value) {
            onChange(newFullValue);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        let pasteData = e.clipboardData.getData('text').trim();
        if (pasteData.startsWith('+58')) {
            pasteData = '0' + pasteData.substring(3);
        }
        const digits = pasteData.replace(/[^0-9]/g, '');

        let newPrefix = '0414';
        let newNumber = digits;

        const sortedPrefixes = [...phonePrefixes].sort((a, b) => b.length - a.length);
        for (const p of sortedPrefixes) {
            if (digits.startsWith(p)) {
                newPrefix = p;
                newNumber = digits.substring(p.length);
                break;
            }
        }
        
        triggerChange(newPrefix, newNumber);
    };

    return (
        <div className="flex w-full items-center gap-2">
            <select
                value={prefix}
                onChange={(e) => triggerChange(e.target.value, number)}
                className="bg-ciec-bg border border-ciec-border rounded-lg px-3 py-2 text-ciec-text-primary focus:ring-2 focus:ring-ciec-blue focus:outline-none"
            >
                {phonePrefixes.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input
                type="tel"
                value={number}
                onChange={(e) => triggerChange(prefix, e.target.value)}
                onPaste={handlePaste}
                className="w-full bg-ciec-bg border border-ciec-border rounded-lg px-3 py-2 text-ciec-text-primary focus:ring-2 focus:ring-ciec-blue focus:outline-none"
                placeholder="Número"
                pattern="[0-9]*"
            />
        </div>
    );
};


interface EmpresaFormFieldsProps {
    isEditing: boolean;
    formData: any;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handleCoordinatesPaste: (lat: number | null, lon: number | null) => void;
    
    telefonos: string[];
    handleTelefonoChange: (index: number, value: string) => void;
    handleAddTelefono: () => void;
    handleRemoveTelefono: (index: number) => void;

    logoPreview: string | null;
    handleLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleClearLogo: () => void;

    dropdowns: {
        estados: any[];
        municipios: any[];
        parroquias: any[];
        afiliaciones: any[];
        secCaev: any[];
        divCaev: any[];
        classCaev: any[];
    };

    filteredDropdowns: {
        filteredMunicipios: any[];
        filteredParroquias: any[];
        filteredDivCaev: any[];
        filteredClassCaev: any[];
    };
}

const EmpresaFormFields: React.FC<EmpresaFormFieldsProps> = ({
    isEditing,
    formData,
    handleChange,
    handleCoordinatesPaste,
    telefonos,
    handleTelefonoChange,
    handleAddTelefono,
    handleRemoveTelefono,
    logoPreview,
    handleLogoChange,
    handleClearLogo,
    dropdowns,
    filteredDropdowns
}) => {
    const [localCoords, setLocalCoords] = useState('');
    const rifPrefixes = ['J', 'V', 'E', 'G', 'P'];
    const [rifPrefix, setRifPrefix] = useState('J');
    const [rifNumber, setRifNumber] = useState('');

    // --- RIF LOGIC ---
    useEffect(() => {
        const rif = formData.rif || '';
        if (!rif) {
            setRifPrefix('J');
            setRifNumber('');
            return;
        }

        const firstChar = rif.charAt(0).toUpperCase();
        if (rifPrefixes.includes(firstChar)) {
            setRifPrefix(firstChar);
            setRifNumber(rif.substring(1).replace(/[^0-9]/g, ''));
        } else {
            setRifPrefix('J');
            setRifNumber(rif.replace(/[^0-9]/g, ''));
        }
    }, [formData.rif]);

    const handleRifChange = (prefix: string, number: string) => {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        const newRifValue = cleanNumber ? `${prefix}${cleanNumber}` : '';
        if (newRifValue !== formData.rif) {
            handleChange({ target: { name: 'rif', value: newRifValue } } as any);
        }
    };

    const handleRifPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').trim().toUpperCase();
        let newPrefix = 'J';
        let newNumber = pasteData.replace(/[^0-9]/g, '');

        const firstChar = pasteData.charAt(0);
        if (rifPrefixes.includes(firstChar)) {
            newPrefix = firstChar;
            newNumber = pasteData.substring(1).replace(/[^0-9]/g, '');
        }
        handleRifChange(newPrefix, newNumber);
    };
    
    // --- COORDINATES LOGIC ---
    useEffect(() => {
        if (formData.latitude != null && formData.longitude != null) {
            setLocalCoords(`${formData.latitude}, ${formData.longitude}`);
        } else {
            setLocalCoords('');
        }
    }, [formData.latitude, formData.longitude]);
    
    const onPasteCoordinates = (e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text');
        const parts = text.split(/[,;]/).map(part => part.trim());
        if (parts.length === 2) {
            const lat = parseFloat(parts[0]);
            const lon = parseFloat(parts[1]);
            if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
                handleCoordinatesPaste(lat, lon);
            } else {
                alert('Coordenadas no válidas. El formato debe ser "latitud, longitud".');
            }
        } else {
            alert('Formato de coordenadas no válido. Pegue las coordenadas copiadas de Google Maps.');
        }
    };
    
    const handleCoordinatesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setLocalCoords(value);

        if (value.trim() === '') {
            handleCoordinatesPaste(null, null);
            return;
        }

        const parts = value.split(/[,;]/).map(part => part.trim());
        if (parts.length === 2) {
            const lat = parseFloat(parts[0]);
            const lon = parseFloat(parts[1]);
            if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
                handleCoordinatesPaste(lat, lon);
            }
        }
    };

    return (
        <>
            <Fieldset legend="Datos de Identificación">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="rifNumber" className="block text-sm font-medium text-ciec-text-secondary mb-1">RIF*</label>
                        <div className="flex items-center gap-2">
                             <select
                                value={rifPrefix}
                                onChange={(e) => handleRifChange(e.target.value, rifNumber)}
                                className="bg-ciec-bg border border-ciec-border rounded-lg px-3 py-2 text-ciec-text-primary focus:ring-2 focus:ring-ciec-blue focus:outline-none"
                            >
                                {rifPrefixes.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <input
                                id="rifNumber"
                                name="rifNumber"
                                value={rifNumber}
                                onPaste={handleRifPaste}
                                onChange={(e) => handleRifChange(rifPrefix, e.target.value)}
                                className="w-full bg-ciec-bg border border-ciec-border rounded-lg px-3 py-2 text-ciec-text-primary focus:ring-2 focus:ring-ciec-blue focus:outline-none"
                                placeholder="12345678"
                                required
                                pattern="[0-9]*"
                            />
                        </div>
                    </div>
                    <InputField label="Razón Social" name="razon_social" value={formData.razon_social} onChange={handleChange} required />
                    <InputField label="Nombre Establecimiento" name="nombre_establecimiento" value={formData.nombre_establecimiento} onChange={handleChange} />
                    <InputField label="Código Empresa" name="code" value={formData.code} onChange={handleChange} required readOnly={isEditing} />
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-ciec-text-secondary mb-1">Logo</label>
                        <div className="mt-1 flex items-center gap-4">
                            <div className="w-24 h-24 rounded-lg bg-ciec-bg border-2 border-dashed border-ciec-border flex items-center justify-center text-ciec-text-secondary">
                                {logoPreview ? <img src={logoPreview} alt="preview" className="w-full h-full object-cover rounded-md" /> : <UploadCloud size={32}/>}
                            </div>
                            <input type="file" id="logo" onChange={handleLogoChange} accept="image/*" className="hidden" />
                            <button type="button" onClick={() => document.getElementById('logo')?.click()} className="px-4 py-2 bg-ciec-border rounded-lg hover:bg-gray-600">Cambiar</button>
                            {logoPreview && <button type="button" onClick={handleClearLogo} className="p-2 text-red-500 hover:bg-red-900/50 rounded-full"><X size={16}/></button>}
                        </div>
                    </div>
                </div>
            </Fieldset>

            <Fieldset legend="Información de Contacto">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Persona Contacto" name="persona_contacto" value={formData.persona_contacto} onChange={handleChange} />
                    <InputField label="E-mail" name="email" type="email" value={formData.email} onChange={handleChange} />
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-ciec-text-secondary">Teléfonos</label>
                        {telefonos.map((tel, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <TelefonoInput 
                                    value={tel} 
                                    onChange={(newVal) => handleTelefonoChange(index, newVal)} 
                                />
                                {telefonos.length > 1 && <button type="button" onClick={() => handleRemoveTelefono(index)} className="p-2 text-red-500 hover:bg-red-900/50 rounded-full"><Minus size={16}/></button>}
                            </div>
                        ))}
                        {telefonos.length < 2 && <button type="button" onClick={handleAddTelefono} className="text-sm text-ciec-blue hover:text-blue-400 font-medium flex items-center gap-1"><Plus size={14}/> Añadir teléfono</button>}
                    </div>
                 </div>
            </Fieldset>

            <Fieldset legend="Ubicación Geográfica">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectField label="Estado" name="estado_id" value={formData.estado_id} onChange={handleChange} options={dropdowns.estados.map(e => ({id: e.id, name: e.nombre_estado}))} />
                    <SelectField label="Municipio" name="municipio_id" value={formData.municipio_id} onChange={handleChange} options={filteredDropdowns.filteredMunicipios.map(m => ({id: m.id, name: m.nombre_municipio}))} disabled={!formData.estado_id} />
                    <SelectField label="Parroquia" name="parroquia_id" value={formData.parroquia_id} onChange={handleChange} options={filteredDropdowns.filteredParroquias.map(p => ({id: p.id, name: p.nombre_parroquia}))} disabled={!formData.municipio_id} />
                    <InputField label="Dirección Fiscal" name="direccion_fiscal" value={formData.direccion_fiscal} onChange={handleChange} as="textarea" />
                    <InputField label="Dirección Establecimiento" name="direccion_establecimiento" value={formData.direccion_establecimiento} onChange={handleChange} as="textarea" />
                    <div className="md:col-span-2">
                         <InputField 
                            label="Coordenadas"
                            name="coordinates"
                            value={localCoords}
                            onChange={handleCoordinatesChange}
                            onPaste={onPasteCoordinates}
                            placeholder="Pegar o escribir coordenadas (ej: 10.123, -68.456)"
                            title="Copie y pegue las coordenadas desde Google Maps o escríbalas manualmente"
                        />
                        {formData.latitude && formData.longitude && (
                            <div className="mt-4 h-64 rounded-lg overflow-hidden border border-ciec-border">
                                <GoogleMap
                                    mapContainerStyle={{ width: '100%', height: '100%' }}
                                    center={{ lat: formData.latitude, lng: formData.longitude }}
                                    zoom={15}
                                    options={{
                                        styles: darkMapStyle,
                                        mapTypeControl: true,
                                        zoomControl: true,
                                        streetViewControl: false,
                                        fullscreenControl: true,
                                        clickableIcons: false,
                                    }}
                                >
                                    <MarkerF position={{ lat: formData.latitude, lng: formData.longitude }} />
                                </GoogleMap>
                            </div>
                        )}
                    </div>
                </div>
            </Fieldset>
            
            <Fieldset legend="Clasificación y Detalles">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <SelectField label="Afiliada a" name="afiliacion_id" value={formData.afiliacion_id} onChange={handleChange} options={dropdowns.afiliaciones.map(a => ({id: a.id, name: a.nombre_afiliacion}))} />
                    <SelectField label="Sección CAEV" name="sec_caev_id" value={formData.sec_caev_id} onChange={handleChange} options={dropdowns.secCaev.map(s => ({id: s.id, name: s.descripcion_sec}))} />
                    <SelectField label="División CAEV" name="div_caev_id" value={formData.div_caev_id} onChange={handleChange} options={filteredDropdowns.filteredDivCaev.map(d => ({id: d.id, name: d.descripcion_div}))} disabled={!formData.sec_caev_id} />
                    <SelectField label="Clase CAEV" name="class_caev_id" value={formData.class_caev_id} onChange={handleChange} options={filteredDropdowns.filteredClassCaev.map(c => ({id: c.id, name: c.descripcion_class}))} disabled={!formData.div_caev_id} />
                    <InputField label="Año de Fundación" name="anio_fundacion" type="number" value={formData.anio_fundacion} onChange={handleChange} />
                    <div className="md:col-span-2 lg:col-span-3">
                        <InputField label="Productos y Marcas" name="productos_y_marcas" value={formData.productos_y_marcas} onChange={handleChange} as="textarea" />
                    </div>
                </div>
            </Fieldset>
            
            <Fieldset legend="Capital Humano">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField label="Nº de Obreros" name="obreros" type="number" value={formData.obreros} onChange={handleChange} />
                    <InputField label="Nº de Empleados" name="empleados" type="number" value={formData.empleados} onChange={handleChange} />
                    <InputField label="Nº de Directivos" name="directivos" type="number" value={formData.directivos} onChange={handleChange} />
                </div>
            </Fieldset>
        </>
    );
};

export default EmpresaFormFields;