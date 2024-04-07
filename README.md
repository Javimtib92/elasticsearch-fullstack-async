# newtral-tech-test

## Introduction

This README file serves as a guide to help you understand the structure of the project, how to set it up, and how to get started with development.

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
    
  test:
    # Test service configuration...
    
  elastic_setup:
    # Elasticsearch setup service configuration...
    
  es01:
    # Elasticsearch service configuration...
    
  kibana:
    # Kibana service configuration...
```

To install docker-compose follow this guideline: https://docs.docker.com/compose/install/#installation-scenarios

For me the best way to install it is by installing `Docker Desktop`.

## Running the Project

> ⚠️ Remember to start Docker Desktop first

To start the project, navigate to the project directory containing the `docker-compose.yml` file and run:

```bash
docker-compose up
```

This command will start all the services defined in the `docker-compose.yml` file.

> ☕ Sit down and drink a relaxing cup of cafe con leche because this will take a while the first time it has to pull the images

## Accessing Services

After setting up the project using Docker Compose, you can access the following services:

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

- Ensure you have set the required environment variables in the `.env` file. You can just copy `.env.local`.
- Modify the Docker Compose configuration (`docker-compose.yml`) as needed for your environment, such as adjusting ports or memory limits.

## How to test endpoints instructions (demo purposes)
We'll use `/docs` endpoint as if it was our "postman" to execute each endpoint.

### Test bulk

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