import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';

import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import CompaniesList from './pages/CompaniesList';
import CompanyForm from './pages/CompanyForm';
import MapView from './pages/MapView';
import AdminLayout from './pages/admin/AdminLayout';
import GenericCrudPage from './pages/admin/GenericCrudPage';
import NotFound from './pages/NotFound';
import { 
  estadosConfig,
  municipiosConfig,
  parroquiasConfig,
  urbanizacionesConfig,
  afiliacionesConfig,
  estadosComisionConfig,
  comisionesConfig,
  integrantesConfig
} from './pages/admin/adminConfigs';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex h-screen bg-ciec-light-gray">
    <Sidebar />
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      {children}
    </main>
  </div>
);

const App: React.FC = () => {
  // In a real app, the API key would be in an environment variable
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

  return (
    <APIProvider apiKey={googleMapsApiKey}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/companies" element={<AppLayout><CompaniesList /></AppLayout>} />
          <Route path="/company/new" element={<AppLayout><CompanyForm /></AppLayout>} />
          <Route path="/company/edit/:code" element={<AppLayout><CompanyForm /></AppLayout>} />
          <Route path="/map" element={<AppLayout><MapView /></AppLayout>} />
          <Route path="/admin" element={<AppLayout><AdminLayout /></AppLayout>}>
            <Route index element={<Navigate to="estados" replace />} />
            <Route path="estados" element={<GenericCrudPage config={estadosConfig} />} />
            <Route path="municipios" element={<GenericCrudPage config={municipiosConfig} />} />
            <Route path="parroquias" element={<GenericCrudPage config={parroquiasConfig} />} />
            <Route path="urbanizaciones" element={<GenericCrudPage config={urbanizacionesConfig} />} />
            <Route path="afiliaciones" element={<GenericCrudPage config={afiliacionesConfig} />} />
            <Route path="estados-comision" element={<GenericCrudPage config={estadosComisionConfig} />} />
            <Route path="comisiones" element={<GenericCrudPage config={comisionesConfig} />} />
            <Route path="integrantes" element={<GenericCrudPage config={integrantesConfig} />} />
          </Route>
          <Route path="*" element={<AppLayout><NotFound /></AppLayout>} />
        </Routes>
      </BrowserRouter>
    </APIProvider>
  );
};

export default App;
