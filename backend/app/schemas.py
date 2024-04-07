from typing import List
from pydantic import BaseModel, field_validator

from app.utils import partial_model


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


class ClusterStatusResponse(BaseModel):
    cluster_name: str
    status: str
    timed_out: bool
    number_of_nodes: int
    number_of_data_nodes: int
    active_primary_shards: int
    active_shards: int
    relocating_shards: int
    delayed_unassigned_shards: int
    number_of_pending_tasks: int
    number_of_in_flight_fetch: int
    task_max_waiting_in_queue_millis: int
    active_shards_percent_as_number: float


class MessageResponse(BaseModel):
    message: str


class StatisticsResponse(BaseModel):
    mean_salary: float
    median_salary: float
    top_salaries: List[Politician]


class ErrorResponse(BaseModel):
    detail: str
