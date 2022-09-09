# BEN'S NEWS API

A back end news API project using node JS and PostgreSQL

## HOSTED VERSION

https://bens-news.herokuapp.com/

## SETUP ----------->>>>>

    >>>> CLONE

        git clone https://github.com/benboosh01/bb-be-nc-news

    >>>> ENV files

        Create two .env files:

        .env.test --> add: PGDATABASE=nc_news_test

        .env.development. --> add: PGDATABASE=nc_news

        Double check that these .env files are .gitignored.

    >>>> DEV DEPENDENCIES

    to install the below: npm i

        "husky": "^7.0.0"
        "jest": "^27.5.1"
        "jest-extended": "^2.0.0"
        "jest-sorted": "^1.0.14"
        "supertest": "^6.2.4"

    >>>> SETUP LOCAL DATABASE

        npm setup-dbs

    >>>> SEED LOCAL DATABASE

        npm seed

    >>>> TEST

        npm test

## MINIMUM REQUIREMENTS ----------->>>>>

node v18.6.0

postgres (PostgreSQL) 14.4
