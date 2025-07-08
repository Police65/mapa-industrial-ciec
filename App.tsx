
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoadScript } from '@react-google-maps/api';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Mapa from './pages/Mapa';
import Empresas from './pages/Empresas';
import Gremios from './pages/Gremios';
import Graficos from './pages/Graficos';
import Reportes from './pages/Reportes';
import Integrantes from './pages/Integrantes';
import EmpresaForm from './pages/EmpresaForm';
import GremioForm from './pages/GremioForm';
import IntegranteForm from './pages/IntegranteForm';
import { Page } from './types';
import { DraftProvider, useDraft } from './contexts/DraftContext';
import EmpresaFormDrawer from './components/empresa/EmpresaFormDrawer';
import FloatingDraftBubble from './components/empresa/FloatingDraftBubble';
import DiscardArea from './components/ui/DiscardArea';
import ConfirmDiscardModal from './components/ui/ConfirmDiscardModal';
import { GOOGLE_MAPS_API_KEY } from './constants';


const AppContent: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('Mapa');
    const { isDraggingBubble, isDirty } = useDraft();

    return (
        <>
            <div className="flex h-screen bg-ciec-bg text-ciec-text-primary">
                <Sidebar setCurrentPage={setCurrentPage} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header currentPage={currentPage} />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-ciec-bg p-4 md:p-6 lg:p-8">
                        <Routes>
                            <Route path="/" element={<Navigate to="/mapa" />} />
                            <Route path="/mapa" element={<Mapa />} />
                            <Route path="/empresas" element={<Empresas />} />
                            <Route path="/empresas/editar/:code" element={<EmpresaForm />} />
                            <Route path="/gremios" element={<Gremios />} />
                            <Route path="/gremios/nuevo" element={<GremioForm />} />
                            <Route path="/integrantes" element={<Integrantes />} />
                            <Route path="/integrantes/nuevo" element={<IntegranteForm />} />
                            <Route path="/reportes" element={<Reportes />} />
                            <Route path="/graficos" element={<Graficos />} />
                            {/* Add other routes for settings, info, etc. */}
                        </Routes>
                    </main>
                </div>
            </div>
            <EmpresaFormDrawer />
            <FloatingDraftBubble />
            <DiscardArea isVisible={isDraggingBubble && isDirty} />
            <ConfirmDiscardModal />
        </>
    );
}

const App: React.FC = () => {
    return (
        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
            <HashRouter>
                <DraftProvider>
                    <AppContent />
                </DraftProvider>
            </HashRouter>
        </LoadScript>
    );
};

export default App;
