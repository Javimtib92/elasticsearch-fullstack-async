export type Politician = {
  nombre: string;
  partido: string;
  partido_para_filtro: string;
  genero: string;
  cargo_para_filtro: string;
  cargo: string;
  institucion: string;
  ccaa: string;
  sueldobase_sueldo: number;
  complementos_sueldo: number;
  pagasextra_sueldo: number;
  otrasdietaseindemnizaciones_sueldo: number;
  trienios_sueldo: number;
  retribucionmensual: number;
  retribucionanual: number;
  observaciones: string;
  _id: string;
};

export type PoliticiansSearch = {
  page: number;
  perPage: number;
  filter?: string;
};
export type GetAllPoliticiansSearchParams = {
  page?: number;
  perPage?: number;
  name?: string;
  party?: string;
  gender?: string;
};
