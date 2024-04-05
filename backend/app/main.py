from typing import Union

from fastapi import FastAPI

app = FastAPI()


@app.post("/bulk")
def bulk():
    return {"Hello": "World"}


@app.get("/politicians")
def get_all_politicians(filter: Union[str, None] = None):
    return {"Hello": "World", "filter": filter}


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
