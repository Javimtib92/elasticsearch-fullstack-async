from typing import Union, Optional
from app.search import Search, get_es
from fastapi import FastAPI, Depends, File, UploadFile, HTTPException, Query
import csv
from elasticsearch.helpers import async_streaming_bulk
from elasticsearch import AsyncElasticsearch

import io

app = FastAPI()


@app.on_event("shutdown")
async def app_shutdown(es: Optional[Search] = Depends(get_es)):
    await es.close()


@app.get("/")
async def index(es: Optional[Search] = Depends(get_es)):
    return await es.cluster.health()


@app.delete("/clear_index/{index_name}")
async def clear_index_endpoint(
    index_name: str, es: AsyncElasticsearch = Depends(get_es)
):
    if not await es.indices.exists(index=index_name):
        raise HTTPException(status_code=404, detail="Index not found")

    await es.delete_by_query(index=index_name, body={"query": {"match_all": {}}})
    return {
        "message": f"All documents in index {index_name} have been successfully cleared"
    }


# using utf-8-sig encoding as suggested by https://github.com/clld/clldutils/issues/65#issuecomment-344953000
def csv_row_generator(upload_file):
    with io.TextIOWrapper(
        upload_file.file, encoding="utf-8-sig", newline=""
    ) as text_file:
        csv_reader = csv.reader(text_file, delimiter=";")

        headers = next(csv_reader)

        for row in csv_reader:
            data = {}
            for index, header in enumerate(headers):
                data[header.lower()] = row[index]
            yield {"_index": "politicians", **data}


@app.post("/bulk")
async def bulk(file: UploadFile = File(...), es: Optional[Search] = Depends(get_es)):
    if not file.filename.endswith(".csv"):
        return {"error": "Only CSV files are supported"}

    if not (await es.indices.exists(index="politicians")):
        await es.indices.create(index="politicians")

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
    query = {"bool": {"must": [], "filter": {}}}

    if name:
        query["bool"]["must"].append(
            {"match": {"nombre": {"query": name, "fuzziness": "auto"}}}
        )

    if party or political_occupation:
        terms_filter = {}
        if party:
            party_list = party.split(",")
            terms_filter["partido_para_filtro"] = party_list
        if political_occupation:
            political_occupation_list = political_occupation.split(",")
            terms_filter["cargo_para_filtro"] = political_occupation_list

        query["bool"]["filter"]["terms"] = terms_filter

    result = await es.search(
        index="politicians",
        body={
            "query": query,
            "from": (page - 1) * per_page,
            "size": per_page,
        },
    )
    return result


@app.get("/politicians/{id}")
def get_politician_by_id(item_id: int):
    return {"operation": "get", "id": item_id}


@app.patch("/politicians/{id}")
def update_politician(item_id: int):
    return {"operation": "patch", "id": item_id}


@app.delete("/politicians/{id}")
def delete_politician(item_id: int):
    return {"operation": "delete", "id": item_id}


@app.get("/statistics")
def get_statistics():
    return {"Hello": "World"}
