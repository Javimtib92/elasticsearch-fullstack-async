from typing import List
from pydantic import BaseModel, field_validator, Field

from app.utils import partial_model


class Politician(BaseModel):
    # Comment for clarification, text_field defines a field that will be of type keyword AND text in elasticsearch
    nombre: str = Field(..., text_field=True)
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
    observaciones: str = Field(..., text_field=True)

    @field_validator(
        "sueldobase_sueldo",
        "complementos_sueldo",
        "pagasextra_sueldo",
        "otrasdietaseindemnizaciones_sueldo",
        "trienios_sueldo",
        "retribucionmensual",
        "retribucionanual",
        mode="before",
    )
    @classmethod
    def string_to_float(cls, value: str) -> float:
        if value == "":
            return 0.0
        try:
            return float(value)
        except ValueError:
            raise ValueError("Could not convert string to float")


@partial_model
class PoliticianUpdate(Politician):
    pass


class PoliticianEntry(Politician):
    id: str = Field(None, alias="_id")


class MessageResponse(BaseModel):
    message: str


class StatisticsResponse(BaseModel):
    mean_salary: float
    median_salary: float
    top_salaries: List[PoliticianEntry]


class ErrorResponse(BaseModel):
    detail: str
