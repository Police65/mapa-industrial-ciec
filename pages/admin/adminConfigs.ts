import { CrudConfig } from './types';

export const estadosConfig: CrudConfig = {
  tableName: 'estados',
  pageTitle: 'Estados de Venezuela',
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

export const municipiosConfig: CrudConfig = {
  tableName: 'municipios',
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
  selects: {
    estado_id: { tableName: 'estados', key: 'id', value: 'nombre_estado' },
  },
  join: 'estados(nombre_estado)',
  unique_composite_columns: ['nombre_municipio', 'estado_id']
};

export const parroquiasConfig: CrudConfig = {
    tableName: 'parroquias',
    pageTitle: 'Parroquias',
    itemName: 'Parroquia',
    columns: [
        { key: 'id', header: 'ID' },
        { key: 'nombre_parroquia', header: 'Nombre' },
        { key: 'municipios.nombre_municipio', header: 'Municipio' },
    ],
    formFields: [
        { name: 'nombre_parroquia', label: 'Nombre de la Parroquia', type: 'text', required: true },
        { name: 'municipio_id', label: 'Municipio', type: 'select', required: true },
    ],
    selects: {
        municipio_id: { tableName: 'municipios', key: 'id', value: 'nombre_municipio' },
    },
    join: 'municipios(nombre_municipio)',
    unique_composite_columns: ['nombre_parroquia', 'municipio_id']
};

export const urbanizacionesConfig: CrudConfig = {
    tableName: 'urbanizaciones',
    pageTitle: 'Urbanizaciones y Zonas Industriales',
    itemName: 'Urbanización/Zona',
    columns: [
        { key: 'id', header: 'ID' },
        { key: 'nombre_urbanizacion', header: 'Nombre' },
        { key: 'parroquias.nombre_parroquia', header: 'Parroquia' },
    ],
    formFields: [
        { name: 'nombre_urbanizacion', label: 'Nombre de Urbanización/Zona', type: 'text', required: true },
        { name: 'parroquia_id', label: 'Parroquia', type: 'select', required: true },
    ],
    selects: {
        parroquia_id: { tableName: 'parroquias', key: 'id', value: 'nombre_parroquia' },
    },
    join: 'parroquias(nombre_parroquia)',
    unique_composite_columns: ['nombre_urbanizacion', 'parroquia_id']
};

export const afiliacionesConfig: CrudConfig = {
    tableName: 'afiliaciones',
    pageTitle: 'Tipos de Afiliación',
    itemName: 'Afiliación',
    columns: [
        { key: 'id', header: 'ID' },
        { key: 'nombre_afiliacion', header: 'Nombre' },
    ],
    formFields: [
        { name: 'nombre_afiliacion', label: 'Nombre de la Afiliación', type: 'text', required: true },
    ],
    unique_column: 'nombre_afiliacion',
};

export const estadosComisionConfig: CrudConfig = {
    tableName: 'estados_comision',
    pageTitle: 'Estados de Comisión',
    itemName: 'Estado de Comisión',
    columns: [
        { key: 'id', header: 'ID' },
        { key: 'nombre_estado', header: 'Nombre' },
        { key: 'descripcion', header: 'Descripción' },
    ],
    formFields: [
        { name: 'nombre_estado', label: 'Nombre del Estado', type: 'text', required: true },
        { name: 'descripcion', label: 'Descripción', type: 'text' },
    ],
    unique_column: 'nombre_estado',
};

export const comisionesConfig: CrudConfig = {
    tableName: 'comisiones',
    pageTitle: 'Comisiones',
    itemName: 'Comisión',
    columns: [
        { key: 'id_comision', header: 'ID Comisión' },
        { key: 'nombre_comision', header: 'Nombre' },
        { key: 'estados_comision.nombre_estado', header: 'Estado' },
    ],
    formFields: [
        { name: 'id_comision', label: 'ID de la Comisión', type: 'text', required: true },
        { name: 'nombre_comision', label: 'Nombre de la Comisión', type: 'text', required: true },
        { name: 'estado_comision_id', label: 'Estado', type: 'select' },
    ],
    selects: {
        estado_comision_id: { tableName: 'estados_comision', key: 'id', value: 'nombre_estado' },
    },
    join: 'estados_comision(nombre_estado)',
    unique_column: 'id_comision',
};

export const integrantesConfig: CrudConfig = {
    tableName: 'integrantes',
    pageTitle: 'Integrantes',
    itemName: 'Integrante',
    columns: [
        { key: 'id_integrante', header: 'ID Integrante' },
        { key: 'nombre_integrante', header: 'Nombre' },
        { key: 'apellido_integrante', header: 'Apellido' },
        { key: 'comisiones.nombre_comision', header: 'Comisión' },
        { key: 'empresas.razon_social', header: 'Empresa' },
    ],
    formFields: [
        { name: 'id_integrante', label: 'ID del Integrante', type: 'text', required: true },
        { name: 'nombre_integrante', label: 'Nombre', type: 'text', required: true },
        { name: 'apellido_integrante', label: 'Apellido', type: 'text' },
        { name: 'comision_id', label: 'Comisión', type: 'select', required: true },
        { name: 'empresa_code', label: 'Empresa', type: 'select' },
    ],
    selects: {
        comision_id: { tableName: 'comisiones', key: 'id', value: 'nombre_comision' },
        empresa_code: { tableName: 'empresas', key: 'code', value: 'razon_social' },
    },
    join: 'comisiones(nombre_comision), empresas(razon_social)',
    unique_column: 'id_integrante',
};
