--- Create and connect to DB ---
DROP DATABASE bookish;
CREATE DATABASE bookish;
\connect bookish

\i bookish-schema.sql
\i bookish-seed.sql

DROP DATABASE bookish_test;
CREATE DATABASE bookish_test;
\connect bookish_test

\i bookish-schema.sql
\i bookish-seed.sql
