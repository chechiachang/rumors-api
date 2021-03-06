# rumors-api

[![Build Status](https://travis-ci.org/cofacts/rumors-api.svg?branch=master)](https://travis-ci.org/cofacts/rumors-api) [![Coverage Status](https://coveralls.io/repos/github/cofacts/rumors-api/badge.svg?branch=master)](https://coveralls.io/github/cofacts/rumors-api?branch=master)

GraphQL API server for clients like rumors-site and rumors-line-bot

## Configuration

For development, copy `.env.sample` to `.env` and make necessary changes.

For production via [rumors-deploy](http://github.com/cofacts/rumors-deploy), do setups in `docker-compose.yml`.

## Development

### Prerequisite

* Docker & [docker-compose](https://docs.docker.com/compose/install/)

### First-time setup

After cloning this repository & cd into project directory, then install the dependencies.

```
$ git clone --recursive git@github.com:MrOrz/rumors-api.git # --recursive for the submodules
$ cd rumors-api

# This ensures gRPC binary package are installed under correct platform during development
$ docker-compose run --rm --entrypoint="npm i" api
```

If you want to test OAuth2 authentication, you will need to fill in login credentials in `.env`. Please apply for the keys in Facebook, Twitter and Github respectively.

### Start development servers

```
$ mkdir esdata # For elasticsearch DB
$ docker-compose up
```

This will:

* rumors-api server on `http://localhost:5000`. It will be re-started when you update anyfile.
* rumors-site on `http://localhost:3000`. You can populate session cookie by "logging-in" using the site
  (when credentials are in-place in `.env`).
  However, it cannot do server-side rendering properly because rumors-site container cannot access
  localhost URLs.
* Kibana on `http://localhost:6222`.
* ElasticSearch DB on `http://localhost:62222`.
* [URL resolver](https://github.com/cofacts/url-resolver) on `http://localhost:4000`

To stop the servers, just `ctrl-c` and all docker containers will be stopped.

### Populate ElasticSearch with data

Ask a team member to send you `nodes` directory, then run:
```
$ docker-compose stop db
```
to stop db instance.

put the `nodes` directory right inside the `esdata` directory created in the previous step, then restart the database using:

```
$ docker-compose start db
```

### Detached mode & Logs

If you do not want a console occupied by docker-compose, you may use detached mode:

```
$ docker-compose up -d
```

Access the logs using:

```
$ docker-compose logs api     # `api' can also be `db', `kibana'.
$ docker-compose logs -f api  # Tail mode
```

### About `test/rumors-db`

This directory is managed by git submodule. Use the following command to update:

```
$ npm run rumors-db:pull
```

## Lint

```
# Please check lint before you pull request
$ npm run lint
# Automatically fixes format error
$ npm run lint:fix
```

## Test

To prepare test DB, first start an elastic search server on port 62223:

```
$ docker run -d -p "62223:9200" --name "rumors-test-db" docker.elastic.co/elasticsearch/elasticsearch-oss:6.3.2
# If it says 'The name "rumors-test-db" is already in use',
# Just run:
$ docker start rumors-test-db
```

Then run this to start testing:

```
$ npm t
```

If you get "Elasticsearch ERROR : DELETE http://localhost:62223/replies => socket hang up", please check if test database is running. It takes some time for elasticsearch to boot.

If you want to run test on a specific file (ex: `src/xxx/__tests__/ooo.js`), run:

```
$ npm t -- src/xxx/__tests__/ooo.js
```


When you want to update jest snapshot, run:

```
$ npm t -- -u
```

## Deploy

Build docker image. The following are basically the same, but with different docker tags.

```
$ docker build -t cofacts/rumors-api:latest .
```

Run the docker image on local machine, then visit `http://localhost:5000`.
(To test functions involving DB, ElasticSearch DB must work as `.env` specified.)

```
$ docker run --rm -it -p 5000:5000 --env-file .env cofacts/rumors-api
```

## Other scripts

### Fill in `urls` index and `hyperlinks` field for all articles & replies

First, make sure `.env` is configured so that the correct DB is specified.
Then at project root, run:
```
$ node_modules/.bin/babel-node src/scripts/fillAllHyperlinks.js
```

This script would scan for all articles & replies to fill in their `hyperlinks` field, also populates
`urls` index. The `urls` index is used as cache. If an URL already exists in `urls`, it will not trigger
HTTP request.

### Clean up old `urls` entries that are not referenced by any article & reply

The `urls` index serves as a cache of URL scrapper and will enlarge as `ListArticle` is invoked with
URLs. The following script cleans up those `urls` that no article & reply currently uses.

```
$ docker-compose exec api node_modules/.bin/babel-node src/scripts/cleanupUrls.js
```
