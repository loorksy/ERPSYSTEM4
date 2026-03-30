-- Bootstrap minimal PostgreSQL setup (for FerretDB-compatible migration path)
CREATE ROLE lorkerp WITH LOGIN PASSWORD 'CHANGE_THIS_PASSWORD';
CREATE DATABASE lorkerp OWNER lorkerp;
GRANT ALL PRIVILEGES ON DATABASE lorkerp TO lorkerp;
