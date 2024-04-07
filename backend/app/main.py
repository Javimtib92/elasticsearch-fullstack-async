import csv
import io
from contextlib import asynccontextmanager
from typing import Optional

from elasticsearch import AsyncElasticsearch, NotFoundError
from elasticsearch.helpers import async_streaming_bulk
from fastapi import Depends, FastAPI, File, HTTPException, Query, UploadFile
from fastapi.encoders import jsonable_encoder

from app.schemas import Politician, PoliticianUpdate
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


@app.get("/")
async def index(es: Optional[Search] = Depends(get_es)):
    """
    Route to get the health of the Elasticsearch cluster.

    Args:
        es (Optional[Search]): Optional Elasticsearch connection. Default is obtained from `get_es` dependency.

    Returns:
        dict: Elasticsearch cluster health information.
    """
    return await es.cluster.health()


@app.delete("/clear_index/{index_name}")
async def clear_index_endpoint(
    index_name: str, es: AsyncElasticsearch = Depends(get_es)
):
    """
    Route to clear all documents in a specified index.

    Args:
        index_name (str): Name of the index to clear.
        es (Optional[Search]): Optional Elasticsearch connection. Default is obtained from `get_es` dependency.

    Returns:
        dict: Confirmation message if successful.
    """
    if not await es.indices.exists(index=index_name):
        raise HTTPException(status_code=404, detail="Index not found")

    await es.delete_by_query(index=index_name, body={"query": {"match_all": {}}})
    return {
        "message": f"All documents in index {index_name} have been successfully cleared"
    }


def csv_row_generator(upload_file):
    """
    Generator function to convert CSV rows into Elasticsearch actions.

    Args:
        upload_file (UploadFile): Uploaded CSV file.

    Yields:
        dict: Elasticsearch action for each row in the CSV.
    """
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


@app.post("/bulk")
async def bulk(file: UploadFile = File(...), es: Optional[Search] = Depends(get_es)):
    """
    Route to bulk upload politicians' data from a CSV file to Elasticsearch.

    Args:
        file (UploadFile): Uploaded CSV file.
        es (Optional[Search]): Optional Elasticsearch connection. Default is obtained from `get_es` dependency.

    Returns:
        dict: Confirmation message if successful.
    """
    if not file.filename.endswith(".csv"):
        return {"error": "Only CSV files are supported"}

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

    return {"status": "ok"}


@app.get("/politicians")
async def get_all_politicians(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, le=100),
    name: str = None,
    party: str = None,
    political_occupation: str = None,
    es: Optional[Search] = Depends(get_es),
):
    """
    Route to retrieve all politicians with optional filtering.

    Args:
        page (int): Page number for pagination (default 1).
        per_page (int): Number of items per page (default 10, max 100).
        name (str): Filter by politician's name.
        party (str): Filter by politician's party.
        political_occupation (str): Filter by politician's occupation.
        es (Optional[Search]): Optional Elasticsearch connection. Default is obtained from `get_es` dependency.

    Returns:
        List[Dict[str, Any]]: List of politician records.
    """
    query = {"bool": {"must": []}}

    if name:
        query["bool"]["must"].append(
            {"match": {"nombre": {"query": name, "fuzziness": "auto"}}}
        )

    if party or political_occupation:
        query["bool"]["filter"] = {}

        terms_filter = {}
        if party:
            party_list = party.split(",")
            terms_filter["partido_para_filtro"] = party_list
        if political_occupation:
            political_occupation_list = political_occupation.split(",")
            terms_filter["cargo_para_filtro"] = political_occupation_list

        query["bool"]["filter"]["terms"] = terms_filter

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


@app.get("/politicians/{id}")
async def get_politician_by_id(item_id: str, es: Optional[Search] = Depends(get_es)):
    """
    Route to retrieve a politician by ID.

    Args:
        item_id (str): ID of the politician.
        es (Optional[Search]): Optional Elasticsearch connection. Default is obtained from `get_es` dependency.

    Returns:
        Dict[str, Any]: Politician record.
    """
    try:
        result = await es.get(index="politicians", id=item_id)
        return {"_id": result["_id"], **result["_source"]}

    except NotFoundError:
        raise HTTPException(status_code=404, detail="Politician not found")


@app.patch("/politicians/{id}")
async def update_politician(
    item_id: str,
    politician_update: PoliticianUpdate,
    es: Optional[Search] = Depends(get_es),
):
    """
    Route to update a politician's information.

    Args:
        item_id (str): ID of the politician.
        politician_update (PoliticianUpdate): Data to update.
        es (Optional[Search]): Optional Elasticsearch connection. Default is obtained from `get_es` dependency.

    Returns:
        dict: Confirmation message if successful.
    """
    try:
        update_item_encoded = jsonable_encoder(politician_update)
        await es.update(index="politicians", id=item_id, doc=update_item_encoded)
        return {"message": f"Politician {item_id} has been updated successfully"}

    except NotFoundError:
        raise HTTPException(status_code=404, detail="Politician not found")


@app.delete("/politicians/{id}")
async def delete_politician(item_id: str, es: Optional[Search] = Depends(get_es)):
    """
    Route to delete a politician by ID.

    Args:
        item_id (str): ID of the politician.
        es (Optional[Search]): Optional Elasticsearch connection. Default is obtained from `get_es` dependency.

    Returns:
        dict: Confirmation message if successful.
    """
    try:
        await es.delete(index="politicians", id=item_id)
        return {"message": f"Politician {item_id} has been deleted successfully"}

    except NotFoundError:
        raise HTTPException(status_code=404, detail="Politician not found")


@app.get("/statistics")
async def get_statistics(es: Optional[Search] = Depends(get_es)):
    """
    Route to retrieve statistics about politicians' salaries.

    Args:
        es (Optional[Search]): Optional Elasticsearch connection. Default is obtained from `get_es` dependency.

    Returns:
        dict: Statistics including mean salary, median salary, and top salaries.
    """
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
