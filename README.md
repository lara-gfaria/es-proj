# ES - Project
Project Software Engineer | IST - 2024/25

### Objective
Build a website using SpringBoot and Vue.js that aims to connect charities and non-profit organizations with volunteers

# Requirements

* [Postgres >= 14](https://www.postgresql.org/)
* [Java 21](https://openjdk.org/projects/jdk/21/)
* [Maven](https://maven.apache.org/download.cgi)
* [Node 21.6](https://nodejs.org/en/) ([Node Version Manager](https://github.com/nvm-sh/nvm) recommended)
* [Docker](https://www.docker.com/)

# Installation

* Copy data/access.log.example to data/access.log
```
cp data/access.log.example data/access.log
```

* Copy data/access.log.example to data/access.log
```
cp data/error.log.example data/error.log
```

* Copy frontend/example.env to frontend/.env, and uncomment for docker compose up frontend
```
cp frontend/example.env frontend/.env
```

* Build HumanaEthica in project top directory, where docker-compose.yml is
```
docker compose build
```

* Run HumanaEthica
```
docker compose up -d frontend
```

* After changing backend code, for a quick recompile and restart
```
docker compose up --no-deps -d --build backend
```

* Shutdown HumanaEthica
```
docker compose down
```

* Run unit tests
```
docker compose up be-unit-tests 
```

* Run integration tests
```
docker compose up integration-tests
```

* Run Cypress Tests
* uncomment frontend/.env for docker compose up e2e-run
```
docker compose up e2e-run
```

### Made with:
- [Tiago Santos](https://github.com/tiago-gsantos)
