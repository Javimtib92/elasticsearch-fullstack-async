import csv
import io
from contextlib import asynccontextmanager
from typing import List, Optional

from elasticsearch import AsyncElasticsearch, NotFoundError
from elasticsearch.helpers import async_streaming_bulk
from fastapi import Depends, FastAPI, File, HTTPException, Query, UploadFile, status
from fastapi.encoders import jsonable_encoder

from app.schemas import (
    ClusterStatusResponse,
    ErrorResponse,
    MessageResponse,
    Politician,
    PoliticianUpdate,
    StatisticsResponse,
)
from app.search import Search, create_es_mapping, get_es
from app.utils import is_float


@asynccontextmanager
async def lifespan(_: FastAPI, es: Optional[Search] = Depends(get_es)):
    """
    Context manager to handle the lifespan of Elasticsearch connection.
    It yields control to the caller and automatically closes the Elasticsearch connection when exiting the context.

    Args:
        _ (FastAPI): The FastAPI instance.
        es (Optional[Search]): Optional Elasticsearch connection. Default is obtained from `get_es` dependency.

    Yields:
        None
    """
    yield

    es.close()


app = FastAPI(lifespan=lifespan)


@app.get(
    "/",
    response_model=ClusterStatusResponse,  # default response pydantic model
    status_code=status.HTTP_200_OK,  # default status code
    description="Route to get the health of the Elasticsearch cluster.",
    tags=["cluster"],
    summary="Get cluster health details",
    responses={
        status.HTTP_200_OK: {
            "model": ClusterStatusResponse,
            "description": "Cluster details",
        },
    },
)
async def index(es: Optional[Search] = Depends(get_es)):
    return await es.cluster.health()


@app.delete(
    "/clear_index/{index_name}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    description="Route to clear all documents in a specified index.",
    tags=["indices"],
    summary="Clear index from elasticsearch",
    responses={
        status.HTTP_200_OK: {
            "model": MessageResponse,
            "description": "Ok Response",
        },
        status.HTTP_400_BAD_REQUEST: {
            "model": ErrorResponse,
            "description": "Bad Request Response",
        },
    },
)
async def clear_index_endpoint(
    index_name: str, es: AsyncElasticsearch = Depends(get_es)
):
    if not await es.indices.exists(index=index_name):
        raise HTTPException(status_code=404, detail="Index not found")

    await es.delete_by_query(index=index_name, body={"query": {"match_all": {}}})
    return {
        "message": f"All documents in index {index_name} have been successfully cleared"
    }


def csv_row_generator(upload_file):
    with io.TextIOWrapper(
        upload_file.file,
        # using utf-8-sig encoding as suggested by https://github.com/clld/clldutils/issues/65#issuecomment-344953000
        encoding="utf-8-sig",
        newline="",
    ) as text_file:
        csv_reader = csv.reader(text_file, delimiter=";")

        headers = next(csv_reader)

        for row in csv_reader:
            data = {}
            for index, header in enumerate(headers):
                value = row[index]

                if is_float(value):
                    value = float(value.replace(",", "."))

                data[header.lower()] = value

            yield {"_index": "politicians", **data}


@app.post(
    "/bulk",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    description="Route to bulk upload politicians' data from a CSV file to Elasticsearch.",
    tags=["politicians"],
    summary="Bulk upload CSV politicians file to elasticsearch",
    responses={
        status.HTTP_200_OK: {
            "model": MessageResponse,
            "description": "Ok Response",
        },
        status.HTTP_422_UNPROCESSABLE_ENTITY: {
            "model": ErrorResponse,
            "description": "Unprocessable entity (bad file format)",
        },
    },
)
async def bulk(file: UploadFile = File(...), es: Optional[Search] = Depends(get_es)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=422, detail="Only CSV files are supported")

    if not await es.indices.exists(index="politicians"):
        mapping = {"mappings": {"properties": create_es_mapping(Politician)}}
        await es.indices.create(index="politicians", body=mapping)

    async for ok, result in async_streaming_bulk(
        client=es,
        index="politicians",
        actions=csv_row_generator(file),
        raise_on_error=True,
    ):
        action, result = result.popitem()
        if not ok:
            print("failed to %s document %s" % (action, result["_id"]))

    return {"message": "success"}


@app.get(
    "/politicians",
    response_model=List[Politician],
    status_code=status.HTTP_200_OK,
    description="Route to retrieve all politicians with optional filtering.",
    tags=["politicians"],
    summary="Get all politicians",
    responses={
        status.HTTP_200_OK: {
            "model": List[Politician],
            "description": "List of politicians",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": ErrorResponse,
            "description": "Index not found",
        },
    },
)
async def get_all_politicians(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, le=100),
    name: str = None,
    party: str = None,
    gender: str = None,
    es: Optional[Search] = Depends(get_es),
):
    query = {"bool": {"must": []}}

    if name:
        query["bool"]["must"].append(
            {"match": {"nombre": {"query": name, "fuzziness": "auto"}}}
        )

    if party or gender:
        query["bool"]["filter"] = {}

        terms_filter = {}
        if party:
            party_list = party.split(",")
            terms_filter["partido"] = party_list
        if gender:
            gender_list = gender.split(",")
            terms_filter["genero"] = gender_list

        query["bool"]["filter"]["terms"] = terms_filter

    try:
        response = await es.search(
            index="politicians",
            body={
                "query": query,
                "from": (page - 1) * per_page,
                "size": per_page,
            },
        )

        hits = response["hits"]["hits"]

        extracted_hits = [{"_id": hit["_id"], **hit["_source"]} for hit in hits]

        return extracted_hits
    except NotFoundError:
        raise HTTPException(status_code=404, detail="Index not found")


@app.get(
    "/politicians/{id}",
    response_model=Politician,
    status_code=status.HTTP_200_OK,
    description="Route to retrieve a politician by ID.",
    tags=["politicians"],
    summary="Get politician by id",
    responses={
        status.HTTP_200_OK: {
            "model": Politician,
            "description": "Ok Response",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": ErrorResponse,
            "description": "Politician not found",
        },
    },
)
async def get_politician_by_id(item_id: str, es: Optional[Search] = Depends(get_es)):
    try:
        result = await es.get(index="politicians", id=item_id)
        return {"_id": result["_id"], **result["_source"]}

    except NotFoundError:
        raise HTTPException(status_code=404, detail="Politician not found")


@app.patch(
    "/politicians/{id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    description="Route to update a politician's information.",
    tags=["politicians"],
    summary="update politician",
    responses={
        status.HTTP_200_OK: {
            "model": Politician,
            "description": "Ok Response",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": ErrorResponse,
            "description": "Politician not found",
        },
    },
)
async def update_politician(
    item_id: str,
    politician_update: PoliticianUpdate,
    es: Optional[Search] = Depends(get_es),
):
    try:
        update_item_encoded = jsonable_encoder(politician_update)
        await es.update(index="politicians", id=item_id, doc=update_item_encoded)
        return {"message": f"Politician {item_id} has been updated successfully"}

    except NotFoundError:
        raise HTTPException(status_code=404, detail="Politician not found")


@app.delete(
    "/politicians/{id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    description="Route to delete a politician by ID.",
    tags=["politicians"],
    summary="delete politician",
    responses={
        status.HTTP_200_OK: {
            "model": Politician,
            "description": "Ok Response",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": ErrorResponse,
            "description": "Politician not found",
        },
    },
)
async def delete_politician(item_id: str, es: Optional[Search] = Depends(get_es)):
    try:
        await es.delete(index="politicians", id=item_id)
        return {"message": f"Politician {item_id} has been deleted successfully"}

    except NotFoundError:
        raise HTTPException(status_code=404, detail="Politician not found")


@app.get(
    "/statistics",
    response_model=StatisticsResponse,
    status_code=status.HTTP_200_OK,
    description="Route to retrieve statistics about politicians salaries.",
    tags=["politicians"],
    summary="get statistics about politicians salaries",
    responses={
        status.HTTP_200_OK: {
            "model": Politician,
            "description": "Ok Response",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": ErrorResponse,
            "description": "Index not found",
        },
    },
)
async def get_statistics(es: Optional[Search] = Depends(get_es)):
    es_query = {
        "query": {"match_all": {}},
        "size": 10,
        "sort": [{"sueldobase_sueldo": {"order": "desc"}}],
        "aggs": {
            "mean_salary": {"avg": {"field": "sueldobase_sueldo"}},
            "median_salary": {
                "percentiles": {"field": "sueldobase_sueldo", "percents": [50]}
            },
        },
    }

    try:
        response = await es.search(index="politicians", body=es_query)
        hits = response["hits"]["hits"]
        mean_salary = round(response["aggregations"]["mean_salary"]["value"], 2)
        median_salary = round(
            response["aggregations"]["median_salary"]["values"]["50.0"], 2
        )

        extracted_hits = [{"_id": hit["_id"], **hit["_source"]} for hit in hits]

        return {
            "mean_salary": mean_salary,
            "median_salary": median_salary,
            "top_salaries": extracted_hits,
        }
    except NotFoundError:
        raise HTTPException(status_code=404, detail="Index not found")


@app.get(
    "/available_genders",
    response_model=List[str],
    status_code=status.HTTP_200_OK,
    description="Route to retrieve a list of all available genders.",
    tags=["politicians_metadata"],
    summary="Get all available genders",
    responses={
        status.HTTP_200_OK: {
            "description": "List of available genders",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": ErrorResponse,
            "description": "Index not found",
        },
    },
)
async def get_available_genders(es: Optional[Search] = Depends(get_es)):
    try:
        response = await es.search(
            index="politicians",
            body={
                "size": 0,
                "aggs": {"available_genders": {"terms": {"field": "genero"}}},
            },
        )
        buckets = response["aggregations"]["available_genders"]["buckets"]
        available_genders = [bucket["key"] for bucket in buckets]
        return available_genders
    except NotFoundError:
        raise HTTPException(status_code=404, detail="Index not found")


@app.get(
    "/available_parties",
    response_model=List[str],
    status_code=status.HTTP_200_OK,
    description="Route to retrieve a list of all available parties.",
    tags=["politicians_metadata"],
    summary="Get all available parties",
    responses={
        status.HTTP_200_OK: {
            "description": "List of available parties",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": ErrorResponse,
            "description": "Index not found",
        },
    },
)
async def get_available_parties(es: Optional[Search] = Depends(get_es)):
    try:
        response = await es.search(
            index="politicians",
            body={
                "size": 0,
                "aggs": {"available_parties": {"terms": {"field": "partido"}}},
            },
        )
        buckets = response["aggregations"]["available_parties"]["buckets"]
        available_parties = [bucket["key"] for bucket in buckets]
        return available_parties
    except NotFoundError:
        raise HTTPException(status_code=404, detail="Index not found")
