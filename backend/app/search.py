from typing import Optional
import os

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
