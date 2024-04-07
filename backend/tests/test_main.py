from unittest.mock import AsyncMock

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.search import get_es


class MockES:
    def __init__(self):
        self.search = AsyncMock()
        self.get = AsyncMock()
        self.update = AsyncMock()
        self.delete = AsyncMock()
        self.patch = AsyncMock()
        self.indices = IndicesMock()
        self.cluster = ClusterMock()
        self.delete_by_query = AsyncMock()


class ClusterMock:
    def __init__(self):
        self.health = AsyncMock()


class IndicesMock:
    def __init__(self):
        self.exists = AsyncMock()
        self.create = AsyncMock()


mock_es = MockES()


async def mock_get_es():
    return mock_es


app.dependency_overrides[get_es] = mock_get_es


@pytest.fixture
def client():
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


@pytest.mark.asyncio
@pytest.mark.parametrize("mock_es", [mock_es])
async def test_index(client, mock_es):
    mock_es.cluster.health.return_value = "health"
    async with client as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    assert "health" in response.json()


@pytest.mark.asyncio
@pytest.mark.parametrize("mock_es", [mock_es])
async def test_clear_index_endpoint(client, mock_es):
    mock_es.indices.exists.return_value = True
    mock_es.delete_by_query.return_value = True

    response = await client.delete("/clear_index/politicians")
    assert response.status_code == 200


@pytest.mark.asyncio
@pytest.mark.parametrize("mock_es", [mock_es])
async def test_clear_index_endpoint_not_existent(client, mock_es):
    mock_es.indices.exists.return_value = False

    response = await client.delete("/clear_index/politicians")
    assert response.status_code == 404


# @pytest.mark.asyncio
# @pytest.mark.parametrize("mock_es", [mock_es])
# @patch("elasticsearch.helpers.async_streaming_bulk", AsyncMock(return_value=True))
# async def test_bulk_upload(client, mock_es):
#     # Assuming you have a test CSV file named test_data.csv in the same directory as this script
#     file_content = b"mocked file content"  # Replace this with your mock CSV content
#     mock_file = io.BytesIO(file_content)
#     files = {"file": ("test_data.csv", mock_file, "text/csv")}
#     async with client as ac:
#         response = await ac.post("/bulk", files=files)

#     assert response.status_code == 200
#     assert "status" in response.json()


# @pytest.mark.asyncio
# async def test_get_all_politicians(client):
#     async with client as ac:
#         response = await ac.get("/politicians")
#     assert response.status_code == 200
#     assert isinstance(response.json(), list)


# @pytest.mark.asyncio
# async def test_get_politician_by_id(client):
#     async with client as ac:
#         response = await ac.get("/politicians/1")
#     assert (
#         response.status_code == 404
#     )  # Assuming the politician with ID 1 doesn't exist initially


# @pytest.mark.asyncio
# async def test_update_politician(client):
#     async with client as ac:
#         response = await ac.patch("/politicians/1", json={})
#     assert (
#         response.status_code == 404
#     )  # Assuming the politician with ID 1 doesn't exist initially


# @pytest.mark.asyncio
# async def test_delete_politician(client):
#     async with client as ac:
#         response = await ac.delete("/politicians/1")
#     assert (
#         response.status_code == 404
#     )  # Assuming the politician with ID 1 doesn't exist initially


# @pytest.mark.asyncio
# async def test_get_statistics(client):
#     async with client as ac:
#         response = await ac.get("/statistics")
#     assert response.status_code == 200
#     assert "mean_salary" in response.json()
#     assert "median_salary" in response.json()
#     assert "top_salaries" in response.json()
