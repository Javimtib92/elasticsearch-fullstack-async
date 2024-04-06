from app.utils import partial_model
from pydantic import BaseModel


class Politician(BaseModel):
    nombre: str
    partido: str
    partido_para_filtro: str
    genero: str
    cargo_para_filtro: str
    cargo: str
    institucion: str
    ccaa: str
    sueldobase_sueldo: float
    complementos_sueldo: float
    pagasextra_sueldo: float
    otrasdietaseindemnizaciones_sueldo: float
    trienios_sueldo: float
    retribucionmensual: float
    retribucionanual: float
    observaciones: str


@partial_model
class PoliticianUpdate(Politician):
    pass
