


export interface Company {
  code: string;
  rif?: string | null;
  logo_url?: string | null;
  razon_social: string;
  nombre_establecimiento?: string | null;
  persona_contacto?: string | null;
  email?: string | null;
  telefono?: string | null;
  telefono2?: string | null;
  direccion_fiscal?: string | null;
  direccion_establecimiento?: string | null;
  estado_id?: number | null;
  municipio_id?: number | null;
  parroquia_id?: number | null;
  urbanizacion_id?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  afiliacion_id?: number | null;
  class_caev_id?: string | null;
  productos_y_marcas?: string | null;
  obreros?: number | null;
  empleados?: number | null;
  directivos?: number | null;
  anio_fundacion?: number | null;
  created_at?: string;
  updated_at?: string;

  // Joined data for display
  municipios?: { nombre_municipio: string } | null;
  afiliaciones?: { nombre_afiliacion: string } | null;
}

export interface Estado {
    id: number;
    nombre_estado: string;
}

export interface Municipio {
    id: number;
    nombre_municipio: string;
    estado_id: number;
    estados?: { nombre_estado: string } | null;
}

export interface Parroquia {
    id: number;
    nombre_parroquia: string;
    municipio_id: number;
    municipios?: { nombre_municipio: string } | null;
}

export interface Urbanizacion {
    id: number;
    nombre_urbanizacion: string;
    parroquia_id?: number | null;
    parroquias?: { nombre_parroquia: string } | null;
}


export interface Afiliacion {
    id: number;
    nombre_afiliacion: string;
}

export interface ClassCaev {
    id: string;
    descripcion_class: string;
    div_caev_id: string;
}

export interface EstadoComision {
    id: number;
    nombre_estado: string;
    descripcion?: string | null;
}

export interface Comision {
    id: string; // uuid
    id_comision: string;
    nombre_comision: string;
    estado_comision_id?: number | null;
    estados_comision?: { nombre_estado: string } | null;
}

export interface Integrante {
    id: string; // uuid
    id_integrante: string;
    nombre_integrante: string;
    apellido_integrante?: string | null;
    comision_id: string; // uuid
    usuario_id?: string | null; // uuid
    empresa_code?: string | null;
    // Joined data
    comisiones?: { nombre_comision: string } | null;
    empresas?: { razon_social: string } | null;
    usuarios?: { email: string } | null;
}


export interface DashboardStats {
    totalCompanies: number;
    totalEmployees: number;
    affiliatedCompanies: number;
}

export interface CompaniesByMunicipality {
    municipio: string;
    count: number;
}

export interface GenericItem {
    id: number | string;
    [key: string]: any;
}