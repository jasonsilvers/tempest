sudo docker run -d --name next-postgres -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=password -v ${HOME}/dev/postgres/next/:/var/lib/postgresql/nextdata -p 5432:5432 postgres
