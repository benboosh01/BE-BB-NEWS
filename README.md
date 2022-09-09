# BEN'S NEWS API

A back end news API project using node JS and PostgreSQL

## HOSTED VERSION

https://bens-news.herokuapp.com/

## SETUP ----------->>>>>

    >>>> CLONE

        https://github.com/benboosh01/bb-be-nc-news

    >>>> DEPENDENCIES

        "husky": "^7.0.0",
        "jest": "^27.5.1",
        "jest-extended": "^2.0.0",
        "jest-sorted": "^1.0.14",
        "supertest": "^6.2.4"

    >>>> SETUP LOCAL DATABASE

        npm setup-dbs

    >>>> SEED LOCAL DATABASE

        npm seed

    >>>> TEST

        npm test

    >>>> ENV files

        Create two .env files:

        .env.test

        and

        .env.development.

        Into each, add PGDATABASE=<database_name_here>, with the correct database name for that environment (see /db/setup.sql for the database names). Double check that these .env files are .gitignored.

## MINIMUM REQUIREMENTS ----------->>>>>

node v18.6.0

postgres (PostgreSQL) 14.4
