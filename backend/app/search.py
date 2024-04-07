import os
from datetime import datetime
from typing import Dict, List, Optional

from dotenv import load_dotenv
from elasticsearch import AsyncElasticsearch
from pydantic import BaseModel

load_dotenv()


class Search(AsyncElasticsearch):
    """
    Singleton class to handle Elasticsearch connection.
    """

    instance = None

    def __new__(cls) -> AsyncElasticsearch:
        """
        Creates a new instance of the Search class if it doesn't exist.
        Returns:
            AsyncElasticsearch: Elasticsearch client instance.
        """
        if cls.instance is None:
            cls.instance = super().__new__(cls)
            cls.instance.client = AsyncElasticsearch(
                os.environ["ELASTIC_ENDPOINT"],
                ca_certs="/usr/share/backend/config/certs/ca/ca.crt",
                basic_auth=("elastic", os.environ["ELASTIC_PASSWORD"]),
            )
        return cls.instance.client


async def get_es() -> Optional[Search]:
    """
    Asynchronous function to get Elasticsearch instance.
    Returns:
        Optional[Search]: Elasticsearch instance.
    """
    return Search()


type_map: Dict[type, str] = {
    str: "keyword",
    datetime: "date",
    int: "long",
    float: "float",
    list: "keyword",
    dict: "nested",
    List[BaseModel]: "nested",
}


def create_es_mapping(pydantic_model: BaseModel) -> Dict[str, str]:
    """
    Creates Elasticsearch mapping from Pydantic model.
    Args:
        pydantic_model (BaseModel): Pydantic model for which mapping needs to be created.
    Returns:
        dict: Elasticsearch mapping.
    """
    mapping = {}
    for field, field_type in pydantic_model.__annotations__.items():
        es_field_type = type_map.get(field_type)
        if not es_field_type:
            if issubclass(field_type, BaseModel):
                es_field_type = create_es_mapping(field_type)
            else:
                es_field_type = {
                    "type": "nested",
                    "properties": create_es_mapping(field_type.__args__[0]),
                }
        mapping[field] = {"type": es_field_type}
    return mapping
