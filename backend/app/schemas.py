from typing import Optional

from pydantic import BaseModel


class PoliticianUpdate(BaseModel):
    nombre: Optional[str]
    partido: Optional[str]
    partido_para_filtro: Optional[str]
    genero: Optional[str]
    cargo_para_filtro: Optional[str]
    cargo: Optional[str]
    institucion: Optional[str]
    ccaa: Optional[str]
    sueldobase_sueldo: Optional[str]
    complementos_sueldo: Optional[str]
    pagasextra_sueldo: Optional[str]
    otrasdietaseindemnizaciones_sueldo: Optional[str]
    trienios_sueldo: Optional[str]
    retribucionmensual: Optional[str]
    retribucionanual: Optional[str]
    observaciones: Optional[str]
