FROM postgres:16-alpine
ENV POSTGRES_DB=goatvote POSTGRES_USER=goatuser POSTGRES_PASSWORD=goatpass
COPY init /docker-entrypoint-initdb.d

