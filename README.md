# Dosea

> A dosea (daw-see-ey) for your datasets

[![🚀 Deploy](https://github.com/wmluke/dosea/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/wmluke/dosea/actions/workflows/deploy.yml)

![Query with Chart](public/screenshot.w1000.png)

Take a gander at the [demo](https://dosea-7b28.fly.dev/).

## Features

* Supports Sqlite, Postgres, CSV, Prometheus
* Readonly DB connections
* Detailed query results
* Detailed Table Schema
* Sqlite [Sqlean extensions](https://github.com/nalgeon/sqlean) for math and stats aggregation
* Charts powered by [Echarts](https://echarts.apache.org)
* Fully responsive UI for mobile, tablet, and desktop
* Supports Light, Dark, and System UI themes

## Run it at home

Copy the `.env` file and add your information to it.

```sh
cp .env.example .env
```

Install dependencies

```sh
npm install
```

Start dev server:

```sh
npm run dev
```

## Run it in Production

```sh
npm run start
```

## Roadmap

* User Authentication
* Support for mysql
* Support for influx
* Support for JSON, XML, YAML
* Support for Google Sheets, Excel
* Dashboards
* Themes
* Rich SQL editor with code completion & time range & delta utilities
* Rich chart editor
* Stock chart templates for common use-cases
* Embeddable charts via web components
* Scheduled PDF and email reports
* Explore AI integrations to generate queries and charts based on user prompts

## License

Dosea is open-source under the GNU Affero General Public License Version 3 (AGPLv3) or any later version. You
can [find it here](https://github.com/wmluke/dosea/blob/main/LICENSE.md).
