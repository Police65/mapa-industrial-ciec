// This Database type is generated from the Supabase schema.
// For this project, it's manually created based on the provided SQL script.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      afiliaciones: {
        Row: {
          id: string
          nombre_afiliacion: string
          created_at: string
        }
        Insert: {
          id: string
          nombre_afiliacion: string
          created_at?: string
        }
        Update: {
          id?: string
          nombre_afiliacion?: string
          created_at?: string
        }
      }
      class_caev_clasificaciones: {
        Row: {
          id: string
          descripcion_class: string
          div_caev_id: string
          created_at: string
        }
        Insert: {
          id: string
          descripcion_class: string
          div_caev_id: string
          created_at?: string
        }
        Update: {
          id?: string
          descripcion_class?: string
          div_caev_id?: string
          created_at?: string
        }
      }
      div_caev_clasificaciones: {
        Row: {
          id: string
          descripcion_div: string
          sec_caev_id: string
          created_at: string
        }
        Insert: {
          id: string
          descripcion_div: string
          sec_caev_id: string
          created_at?: string
        }
        Update: {
          id?: string
          descripcion_div?: string
          sec_caev_id?: string
          created_at?: string
        }
      }
      sec_caev_clasificaciones: {
        Row: {
          id: string
          descripcion_sec: string
          created_at: string
        }
        Insert: {
          id: string
          descripcion_sec: string
          created_at?: string
        }
        Update: {
          id?: string
          descripcion_sec?: string
          created_at?: string
        }
      }
      empresas: {
        Row: {
          code: string
          rif: string | null
          logo_url: string | null
          razon_social: string
          nombre_establecimiento: string | null
          persona_contacto: string | null
          email: string | null
          telefono: string | null
          telefono2: string | null
          direccion_fiscal: string | null
          direccion_establecimiento: string | null
          estado_id: string | null
          municipio_id: string | null
          parroquia_id: string | null
          urbanizacion_id: string | null
          latitude: number | null
          longitude: number | null
          afiliacion_id: string | null
          sec_caev_id: string | null
          div_caev_id: string | null
          class_caev_id: string | null
          productos_y_marcas: string | null
          obreros: number | null
          empleados: number | null
          directivos: number | null
          anio_fundacion: number | null
          created_at: string
        }
        Insert: {
          code: string
          razon_social: string
          rif?: string | null
          logo_url?: string | null
          nombre_establecimiento?: string | null
          persona_contacto?: string | null
          email?: string | null
          telefono?: string | null
          telefono2?: string | null
          direccion_fiscal?: string | null
          direccion_establecimiento?: string | null
          estado_id?: string | null
          municipio_id?: string | null
          parroquia_id?: string | null
          urbanizacion_id?: string | null
          latitude?: number | null
          longitude?: number | null
          afiliacion_id?: string | null
          sec_caev_id?: string | null
          div_caev_id?: string | null
          class_caev_id?: string | null
          productos_y_marcas?: string | null
          obreros?: number | null
          empleados?: number | null
          directivos?: number | null
          anio_fundacion?: number | null
        }
        Update: {
          code?: string
          rif?: string | null
          logo_url?: string | null
          razon_social?: string
          nombre_establecimiento?: string | null
          persona_contacto?: string | null
          email?: string | null
          telefono?: string | null
          telefono2?: string | null
          direccion_fiscal?: string | null
          direccion_establecimiento?: string | null
          estado_id?: string | null
          municipio_id?: string | null
          parroquia_id?: string | null
          urbanizacion_id?: string | null
          latitude?: number | null
          longitude?: number | null
          afiliacion_id?: string | null
          sec_caev_id?: string | null
          div_caev_id?: string | null
          class_caev_id?: string | null
          productos_y_marcas?: string | null
          obreros?: number | null
          empleados?: number | null
          directivos?: number | null
          anio_fundacion?: number | null
        }
      }
      estados: {
        Row: {
          id: string
          nombre_estado: string
          created_at: string
        }
      }
      municipios: {
        Row: {
          id: string
          nombre_municipio: string
          estado_id: string
          created_at: string
        }
      }
      parroquias: {
        Row: {
          id: string
          nombre_parroquia: string
          municipio_id: string
          created_at: string
        }
      }
      urbanizaciones: {
        Row: {
            id: string
            nombre_urbanizacion: string
            parroquia_id: string | null
            created_at: string
        }
      }
      instituciones: {
        Row: {
            id: string
            nombre_institucion: string
            color: string | null
            created_at: string
        }
        Insert: {
            nombre_institucion: string
            color?: string | null
        }
        Update: {
            nombre_institucion?: string
            color?: string | null
        }
      }
      integrantes: {
          Row: {
            id: string;
            nombre: string;
            email: string;
            cargo: string | null;
            telefono: string | null;
            empresa: string | null;
            area_interes: string | null;
            comision: string | null;
            created_at: string;
          }
          Insert: Omit<Database['public']['Tables']['integrantes']['Row'], 'id' | 'created_at'>;
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Empresa = Database['public']['Tables']['empresas']['Row'];
export type EmpresaInsert = Database['public']['Tables']['empresas']['Insert'];
export type Estado = Database['public']['Tables']['estados']['Row'];
export type Municipio = Database['public']['Tables']['municipios']['Row'];
export type Parroquia = Database['public']['Tables']['parroquias']['Row'];
export type Afiliacion = Database['public']['Tables']['afiliaciones']['Row'];
export type SecCaev = Database['public']['Tables']['sec_caev_clasificaciones']['Row'];
export type DivCaev = Database['public']['Tables']['div_caev_clasificaciones']['Row'];
export type ClassCaev = Database['public']['Tables']['class_caev_clasificaciones']['Row'];
export type Institucion = Database['public']['Tables']['instituciones']['Row'];
export type InstitucionInsert = Database['public']['Tables']['instituciones']['Insert'];
export type InstitucionUpdate = Database['public']['Tables']['instituciones']['Update'];
export type Integrante = Database['public']['Tables']['integrantes']['Row'];

export type Page = 'Mapa' | 'Empresas' | 'Gremios' | 'Integrantes' | 'Reportes' | 'Gráficos' | 'Información' | 'Chat' | 'Configuración';