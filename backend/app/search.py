import os

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from dotenv import load_dotenv
from elasticsearch import AsyncElasticsearch

load_dotenv()


class Search:
    instance = None

    def __new__(cls):
        if cls.instance is None:
            cls.instance = super().__new__(cls)
            cls.instance.client = AsyncElasticsearch(
                os.environ["ELASTIC_ENDPOINT"],
                ca_certs="/usr/share/backend/config/certs/ca/ca.crt",
                basic_auth=("elastic", os.environ["ELASTIC_PASSWORD"]),
            )
        return cls.instance.client


async def get_es() -> Optional[Search]:
    return Search()


# Solution inspired by from https://dzone.com/articles/pydantic-and-elasticsearch-dynamic-couple

type_map = {
    str: "keyword",
    datetime: "date",
    int: "long",
    float: "float",
    list: "keyword",
    dict: "nested",
    List[BaseModel]: "nested",
}


def create_es_mapping(pydantic_model: BaseModel):
    mapping = {}
    for field, field_type in pydantic_model.__annotations__.items():
        es_field_type = type_map.get(field_type)
        if not es_field_type:
            if issubclass(field_type, BaseModel):
                es_field_type = create_es_mapping(field_type)
            else:
                # assuming List[BaseModel] for nested types
                es_field_type = {
                    "type": "nested",
                    "properties": create_es_mapping(field_type.__args__[0]),
                }
        mapping[field] = {"type": es_field_type}
    print(mapping)
    return mapping
