import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { EstablecimientoFormData, EmpresaDraft, DraftContextType, CompaniaInsert, DireccionInsert, EstablecimientoInsert } from '../types';

const DraftContext = createContext<DraftContextType | undefined>(undefined);

const INITIAL_DRAFT_STATE: EmpresaDraft = {
    formData: {
        isNewCompany: null,
        selectedInstitutions: [],
        selectedProducts: [],
        selectedProcesses: [],
    },
    logoFile: null,
    logoPreview: null,
};

// Helper to compare drafts for the isDirty check
const isDraftEqual = (a: EmpresaDraft, b: EmpresaDraft) => {
    return JSON.stringify(a.formData) === JSON.stringify(b.formData) &&
           a.logoFile === b.logoFile;
};

export const DraftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [draft, setDraft] = useState<EmpresaDraft>(INITIAL_DRAFT_STATE);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isDraggingBubble, setIsDraggingBubble] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmDiscardModalOpen, setConfirmDiscardModalOpen] = useState(false);

    const location = useLocation();
    const originalPath = React.useRef(location.pathname);
    
    const isDirty = useMemo(() => !isDraftEqual(draft, INITIAL_DRAFT_STATE), [draft]);
    
    useEffect(() => {
        if (isDrawerOpen && isDirty && location.pathname !== originalPath.current) {
            setIsDrawerOpen(false); 
        }
    }, [location, isDrawerOpen, isDirty]);

    const openDrawer = useCallback(() => {
        originalPath.current = location.pathname;
        setIsDrawerOpen(true);
    }, [location.pathname]);

    const closeDrawer = useCallback(() => {
        setIsDrawerOpen(false);
    }, []);

    const updateDraft = useCallback((updates: Partial<EstablecimientoFormData>) => {
        setDraft(prev => ({
            ...prev,
            formData: { ...prev.formData, ...updates }
        }));
    }, []);

    const setLogo = useCallback((file: File | null, preview: string | null) => {
        setDraft(prev => ({ ...prev, logoFile: file, logoPreview: preview }));
    }, []);

    const resetDraft = useCallback(() => {
        setDraft(INITIAL_DRAFT_STATE);
        setIsSubmitting(false);
        setConfirmDiscardModalOpen(false);
    }, []);

    const discardDraft = useCallback(() => {
        if (isDirty) {
            setConfirmDiscardModalOpen(true);
        }
    }, [isDirty]);

    const handleConfirmDiscard = useCallback(() => {
        resetDraft();
        setIsDrawerOpen(false);
    }, [resetDraft]);

    const handleCancelDiscard = useCallback(() => {
        setConfirmDiscardModalOpen(false);
    }, []);

    const saveDraft = async () => {
        const { formData, logoFile } = draft;
        if (!formData.razon_social || !formData.rif || !formData.nombre_establecimiento || !formData.id_parroquia) {
             return { success: false, error: 'RIF, Razón Social, Nombre Establecimiento y Parroquia son obligatorios.' };
        }
        setIsSubmitting(true);
        
        try {
            // 1. Logo
            let logoUrl: string | undefined | null = formData.logo;
            if (logoFile) {
                const fileName = `${formData.rif}-${Date.now()}`;
                const { data: uploadData, error: uploadError } = await supabase.storage.from('logos').upload(fileName, logoFile, { upsert: true });
                if (uploadError) throw new Error(`Error al subir el logo: ${uploadError.message}`);
                logoUrl = supabase.storage.from('logos').getPublicUrl(uploadData.path).data.publicUrl;
            }

            // 2. "Al Vuelo" Creations
            const newProductsToCreate = formData.selectedProducts?.filter(p => p.id_producto === null)
                .map(p => ({ nombre_producto: p.nombre_producto })) || [];
            const { data: createdProducts, error: pError } = await supabase.from('productos').insert(newProductsToCreate).select();
            if (pError) throw new Error(`Error creando productos: ${pError.message}`);

            const newProcessesToCreate = formData.selectedProcesses?.filter(p => p.id_proceso === null)
                .map(p => ({ nombre_proceso: p.nombre_proceso })) || [];
            const { data: createdProcesses, error: prError } = await supabase.from('procesos_productivos').insert(newProcessesToCreate).select();
            if (prError) throw new Error(`Error creando procesos: ${prError.message}`);

            const productMap = new Map(createdProducts?.map(p => [p.nombre_producto, p.id_producto]));
            const allProducts = formData.selectedProducts?.map(p => ({
                id_producto: p.id_producto ?? productMap.get(p.nombre_producto)
            })) || [];

            const processMap = new Map(createdProcesses?.map(p => [p.nombre_proceso, p.id_proceso]));
            const allProcesses = formData.selectedProcesses?.map(p => ({
                id_proceso: p.id_proceso ?? processMap.get(p.nombre_proceso),
                porcentaje_capacidad_uso: p.porcentaje_capacidad_uso || null
            })) || [];

            // 3. Upsert Compañía
            if (formData.isNewCompany) {
                const companiaData: CompaniaInsert = {
                    rif: formData.rif, razon_social: formData.razon_social, logo: logoUrl,
                    direccion_fiscal: formData.direccion_fiscal, ano_fundacion: formData.ano_fundacion
                };
                const { error } = await supabase.from('companias').insert(companiaData);
                if (error) throw new Error(`Error (Compañía): ${error.message}`);
            }

            // 4. Insert Dirección
            const direccionData: DireccionInsert = {
                id_parroquia: formData.id_parroquia!, direccion_detallada: formData.direccion_detallada,
                latitud: formData.latitud, longitud: formData.longitud
            };
            const { data: newDireccion, error: direccionError } = await supabase.from('direcciones').insert(direccionData).select().single();
            if (direccionError) throw new Error(`Error (Dirección): ${direccionError.message}`);

            // 5. Insert Establecimiento
            const establecimientoData: EstablecimientoInsert = {
                rif_compania: formData.rif, id_direccion: newDireccion.id_direccion, nombre_establecimiento: formData.nombre_establecimiento!,
                id_clase_caev: formData.id_clase_caev, email_principal: formData.email_principal,
                telefono_principal_1: formData.telefono_principal_1, telefono_principal_2: formData.telefono_principal_2,
                fecha_apertura: formData.fecha_apertura, personal_obrero: formData.personal_obrero,
                personal_empleado: formData.personal_empleado, personal_directivo: formData.personal_directivo
            };
            const { data: newEstablecimiento, error: establecimientoError } = await supabase.from('establecimientos').insert(establecimientoData).select().single();
            if (establecimientoError) {
                await supabase.from('direcciones').delete().eq('id_direccion', newDireccion.id_direccion); // Rollback
                throw new Error(`Error (Establecimiento): ${establecimientoError.message}`);
            }

            // 6. Insert Join Table Data
            const id_establecimiento = newEstablecimiento.id_establecimiento;
            const productLinks = allProducts.map(p => ({ id_establecimiento, id_producto: p.id_producto! }));
            const processLinks = allProcesses.map(p => ({ id_establecimiento, id_proceso: p.id_proceso!, porcentaje_capacidad_uso: p.porcentaje_capacidad_uso }));
            const affiliationLinks = formData.selectedInstitutions?.map(rif => ({ id_establecimiento, rif_institucion: rif })) || [];
            
            const inserts = [];
            if(productLinks.length > 0) inserts.push(supabase.from('establecimiento_productos').insert(productLinks));
            if(processLinks.length > 0) inserts.push(supabase.from('establecimiento_procesos').insert(processLinks));
            if(affiliationLinks.length > 0) inserts.push(supabase.from('afiliaciones').insert(affiliationLinks));

            const results = await Promise.all(inserts);
            const joinError = results.find(r => r.error);
            if(joinError) throw new Error(`Error en tablas de unión: ${joinError.error!.message}`);

            alert(`Establecimiento creado exitosamente.`);
            resetDraft();
            setIsDrawerOpen(false);
            return { success: true };

        } catch (error: any) {
            return { success: false, error: error.message };
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const value: DraftContextType = {
        draft,
        isDrawerOpen,
        isDirty,
        isDraggingBubble,
        isSubmitting,
        isConfirmDiscardModalOpen,
        openDrawer,
        closeDrawer,
        updateDraft,
        setLogo,
        saveDraft,
        discardDraft,
        setIsDraggingBubble,
        handleConfirmDiscard,
        handleCancelDiscard,
    };

    return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
};

export const useDraft = () => {
    const context = useContext(DraftContext);
    if (context === undefined) {
        throw new Error('useDraft must be used within a DraftProvider');
    }
    return context;
};