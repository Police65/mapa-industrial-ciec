
import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { EmpresaInsert, EmpresaDraft, DraftContextType } from '../types';

const DraftContext = createContext<DraftContextType | undefined>(undefined);

const INITIAL_DRAFT_STATE: EmpresaDraft = {
    formData: { code: '', razon_social: '' },
    telefonos: [''],
    logoFile: null,
    logoPreview: null,
};

// Helper to compare drafts for the isDirty check
const isDraftEqual = (a: EmpresaDraft, b: EmpresaDraft) => {
    return JSON.stringify(a.formData) === JSON.stringify(b.formData) &&
           JSON.stringify(a.telefonos) === JSON.stringify(b.telefonos) &&
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
    
    // Effect to handle navigation away from a page with an open, dirty drawer
    useEffect(() => {
        if (isDrawerOpen && isDirty && location.pathname !== originalPath.current) {
            // When navigating away, just close the drawer. The bubble will appear automatically.
            setIsDrawerOpen(false); 
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    const openDrawer = useCallback(() => {
        originalPath.current = location.pathname;
        setIsDrawerOpen(true);
    }, [location.pathname]);

    const closeDrawer = useCallback(() => {
        setIsDrawerOpen(false);
    }, []);

    const updateDraft = useCallback((updates: Partial<EmpresaInsert>) => {
        setDraft(prev => ({
            ...prev,
            formData: { ...prev.formData, ...updates }
        }));
    }, []);

    const setTelefonos = useCallback((telefonos: string[]) => {
        setDraft(prev => ({ ...prev, telefonos }));
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
        setIsDrawerOpen(false); // Also close the drawer
    }, [resetDraft]);

    const handleCancelDiscard = useCallback(() => {
        setConfirmDiscardModalOpen(false);
    }, []);

    const saveDraft = async () => {
        if (!draft.formData.razon_social || !draft.formData.code) {
             return { success: false, error: 'Código y Razón Social son obligatorios.' };
        }
        setIsSubmitting(true);
        
        const dataToSave: EmpresaInsert = {
            ...draft.formData,
            code: draft.formData.code!,
            razon_social: draft.formData.razon_social!,
            telefono: draft.telefonos[0] || null,
            telefono2: draft.telefonos[1] || null,
        };

        if (draft.logoFile) {
            const fileName = `${draft.formData.code}-${Date.now()}`;
            const { data: uploadData, error: uploadError } = await supabase.storage.from('logos').upload(fileName, draft.logoFile, { upsert: true });
            if (uploadError) {
                setIsSubmitting(false);
                return { success: false, error: `Error al subir el logo: ${uploadError.message}` };
            }
            const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(uploadData.path);
            dataToSave.logo_url = publicUrl;
        }

        const { error: submitError } = await supabase.from('empresas').insert(dataToSave);
        
        setIsSubmitting(false);
        if (submitError) {
            return { success: false, error: `Error al guardar: ${submitError.message}` };
        } else {
            alert(`Empresa creada exitosamente.`);
            resetDraft();
            setIsDrawerOpen(false);
            return { success: true };
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
        setTelefonos,
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
