


import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';

import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import CompaniesList from './pages/CompaniesList';
import MapView from './pages/MapView';
import CompanyForm from './pages/CompanyForm';
import NotFound from './pages/NotFound';
import AdminLayout from './pages/admin/AdminLayout';
import GenericCrudPage from './pages/admin/GenericCrudPage';
import { CrudConfig } from './pages/admin/types';

const GOOGLE_MAPS_API_KEY = "AIzaSyCfl6VMlwIpaiUmJBhLBswUbHt10YS0IC0";

const estadosConfig: CrudConfig = {
  tableName: 'estados',
  pageTitle: 'Estados',
  itemName: 'Estado',
  columns: [
    { key: 'id', header: 'ID' },
    { key: 'nombre_estado', header: 'Nombre del Estado' },
  ],
  formFields: [
    { name: 'nombre_estado', label: 'Nombre del Estado', type: 'text', required: true },
  ],
  unique_column: 'nombre_estado',
};

const municipiosConfig: CrudConfig = {
  tableName: 'municipios',
  selects: { 'estado_id': { tableName: 'estados', key: 'id', value: 'nombre_estado' } },
  join: 'estados(nombre_estado)',
  pageTitle: 'Municipios',
  itemName: 'Municipio',
  columns: [
    { key: 'id', header: 'ID' },
    { key: 'nombre_municipio', header: 'Nombre del Municipio' },
    { key: 'estados.nombre_estado', header: 'Estado' },
  ],
  formFields: [
    { name: 'nombre_municipio', label: 'Nombre del Municipio', type: 'text', required: true },
    { name: 'estado_id', label: 'Estado', type: 'select', required: true },
  ],
  unique_composite_columns: ['nombre_municipio', 'estado_id'],
};

const parroquiasConfig: CrudConfig = {
  tableName: 'parroquias',
  selects: { 'municipio_id': { tableName: 'municipios', key: 'id', value: 'nombre_municipio' } },
  join: 'municipios(nombre_municipio)',
  pageTitle: 'Parroquias',
  itemName: 'Parroquia',
  columns: [
    { key: 'id', header: 'ID' },
    { key: 'nombre_parroquia', header: 'Nombre de la Parroquia' },
    { key: 'municipios.nombre_municipio', header: 'Municipio' },
  ],
  formFields: [
    { name: 'nombre_parroquia', label: 'Nombre de la Parroquia', type: 'text', required: true },
    { name: 'municipio_id', label: 'Municipio', type: 'select', required: true },
  ],
  unique_composite_columns: ['nombre_parroquia', 'municipio_id'],
};

const urbanizacionesConfig: CrudConfig = {
  tableName: 'urbanizaciones',
  selects: { 'parroquia_id': { tableName: 'parroquias', key: 'id', value: 'nombre_parroquia' } },
  join: 'parroquias(nombre_parroquia)',
  pageTitle: 'Urbanizaciones',
  itemName: 'Urbanización',
  columns: [
    { key: 'id', header: 'ID' },
    { key: 'nombre_urbanizacion', header: 'Nombre de la Urbanización' },
    { key: 'parroquias.nombre_parroquia', header: 'Parroquia' },
  ],
  formFields: [
    { name: 'nombre_urbanizacion', label: 'Nombre de la Urbanización', type: 'text', required: true },
    { name: 'parroquia_id', label: 'Parroquia', type: 'select', required: false },
  ]
};

const afiliacionesConfig: CrudConfig = {
  tableName: 'afiliaciones',
  pageTitle: 'Tipos de Afiliación',
  itemName: 'Afiliación',
  columns: [
    { key: 'id', header: 'ID' },
    { key: 'nombre_afiliacion', header: 'Nombre de la Afiliación' },
  ],
  formFields: [
    { name: 'nombre_afiliacion', label: 'Nombre de la Afiliación', type: 'text', required: true },
  ],
  unique_column: 'nombre_afiliacion',
};

const estadosComisionConfig: CrudConfig = {
  tableName: 'estados_comision',
  pageTitle: 'Estados de Comisión',
  itemName: 'Estado de Comisión',
  columns: [
    { key: 'id', header: 'ID' },
    { key: 'nombre_estado', header: 'Nombre del Estado' },
    { key: 'descripcion', header: 'Descripción' },
  ],
  formFields: [
    { name: 'nombre_estado', label: 'Nombre del Estado', type: 'text', required: true },
    { name: 'descripcion', label: 'Descripción', type: 'text', required: false },
  ],
  unique_column: 'nombre_estado',
};

const comisionesConfig: CrudConfig = {
  tableName: 'comisiones',
  selects: { 'estado_comision_id': { tableName: 'estados_comision', key: 'id', value: 'nombre_estado' } },
  join: 'estados_comision(nombre_estado)',
  pageTitle: 'Comisiones',
  itemName: 'Comisión',
  columns: [
    { key: 'id_comision', header: 'ID Comisión' },
    { key: 'nombre_comision', header: 'Nombre de la Comisión' },
    { key: 'estados_comision.nombre_estado', header: 'Estado' },
  ],
  formFields: [
    { name: 'id_comision', label: 'ID Comisión', type: 'text', required: true },
    { name: 'nombre_comision', label: 'Nombre de la Comisión', type: 'text', required: true },
    { name: 'estado_comision_id', label: 'Estado', type: 'select', required: false },
  ],
  unique_column: 'nombre_comision',
};

const integrantesConfig: CrudConfig = {
  tableName: 'integrantes',
  selects: {
    'comision_id': { tableName: 'comisiones', key: 'id', value: 'nombre_comision' },
    'usuario_id': { tableName: 'usuarios', key: 'id', value: 'email' },
    'empresa_code': { tableName: 'empresas', key: 'code', value: 'razon_social' },
  },
  join: 'comisiones(nombre_comision), empresas(razon_social), usuarios(email)',
  pageTitle: 'Integrantes',
  itemName: 'Integrante',
  columns: [
    { key: 'id_integrante', header: 'ID Integrante' },
    { key: 'nombre_integrante', header: 'Nombre' },
    { key: 'apellido_integrante', header: 'Apellido' },
    { key: 'comisiones.nombre_comision', header: 'Comisión' },
    { key: 'empresas.razon_social', header: 'Empresa' },
    { key: 'usuarios.email', header: 'Usuario (Email)' },
  ],
  formFields: [
    { name: 'id_integrante', label: 'ID Integrante', type: 'text', required: true },
    { name: 'nombre_integrante', label: 'Nombre', type: 'text', required: true },
    { name: 'apellido_integrante', label: 'Apellido', type: 'text', required: false },
    { name: 'comision_id', label: 'Comisión', type: 'select', required: true },
    { name: 'usuario_id', label: 'Usuario', type: 'select', required: false },
    { name: 'empresa_code', label: 'Empresa', type: 'select', required: false },
  ]
};

const App: React.FC = () => {
  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <HashRouter>
        <div className="flex h-screen bg-ciec-light-gray font-sans">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/companies" element={<CompaniesList />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/company/new" element={<CompanyForm />} />
              <Route path="/company/edit/:code" element={<CompanyForm />} />

              <Route path="/admin" element={<AdminLayout />}>
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

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </APIProvider>
  );
};

export default App;