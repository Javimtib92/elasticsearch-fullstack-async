# Elasticsearch Fullstack Async

## Introduction

This README file serves as a guide to help you understand the structure of the project, how to set it up, and how to get started with development.

## Getting Started

To get started with the project, follow these steps:

1. Clone the repository

```bash
git clone git@github.com:Javimtib92/elasticsearch-fullstack-async.git <project_name>
```

2. Navigate to the project directory

```bash
cd <project_name>
```

3. Run docker-compose

```bash
docker-compose up
```

> ⚠️ Remember to start Docker Desktop first. To install docker-compose follow this guideline: https://docs.docker.com/compose/install/#installation-scenarios

This command will start all the services defined in the `docker-compose.yml` file.

> ☕ Sit down and drink a relaxing cup of cafe con leche because this will take a while the first time it has to pull the images

## Docker Compose Setup

I use Docker Compose to simplify the setup and deployment of the project. Below is the configuration for Docker Compose:

```yml
# docker-compose.yml

volumes:
  certs:
    driver: local
  esdata01:
    driver: local
  kibanadata:
    driver: local

networks:
  default:
    name: elastic
    external: false

services:
  backend:
    # Backend service configuration...
    
  backend_test:
    # Backend Test service configuration...
    
  frontend:
    # Frontend service configuration...

  elastic_setup:
    # Elasticsearch setup service configuration...
    
  es01:
    # Elasticsearch service configuration...
    
  kibana:
    # Kibana service configuration...
```

## Accessing Services

After setting up the project using Docker Compose, you can access the following services:

- Frontend Service:
  - URL: http://localhost:3000
  - Port: 3000
- Backend Service:
  - URL: http://localhost:8080
  - Port: 8080
- Elasticsearch:
  - URL: https://localhost:`<ES_PORT>`
  - Port: `<ES_PORT>`
- Kibana:
  - URL: http://localhost:`<KIBANA_PORT>`
  - Port: `<KIBANA_PORT>`

Make sure to replace `<ES_PORT>` and `<KIBANA_PORT>` with the ports defined in your docker-compose.yml file for Elasticsearch and Kibana respectively.

## Additional Configuration

- Ensure you have set the required environment variables in the `.env` file. You can copy `.env.local`.
- Modify the Docker Compose configuration (`docker-compose.yml`) as needed for your environment, such as adjusting ports or memory limits.

## How to test Bulk instructions (demo purposes)

> There is a sample of a data file to import located in `data/import.csv`


### Test bulk (with frontend)

1. Navigate to `http://localhost:3000`
2. Click on `Import CSV`
3. Select the `csv` file.

> To see the Import CSV button the index should not exist, to remove it you have to go to kibana at http://localhost:<KIBANA_PORT> and delete the `politicians` index

### Test bulk (without frontend)

We'll use `/docs` endpoint as if it was our "postman" to execute each endpoint.

1. Navigate to `http://localhost:8080/docs`
2. If the `bulk` was executed previously make sure to clear the index with `/clear_index/${index_name}` endpoint setting `politicians` as the `index_name`.
3. Expand `POST /bulk`, click on `Try it out` button.
4. Select `csv` file on the `file` field.
5. Click on `Execute`
6. Navigate to `http://localhost:5601/` and enter your username and password for Kibana
7. Expand sidebar and navigate to `Content`
8. In available indices you should see `politicians` index with `4095` docs.
9. Click on the index and the overview page will appear
10. Select the `Documents` tab to see the inserted documents.

## References

- Elasticsearch Documentation: https://www.elastic.co/guide/index.html
- Kibana Documentation: https://www.elastic.co/guide/kibana/index.html
- Docker Compose Documentation: https://docs.docker.com/compose
