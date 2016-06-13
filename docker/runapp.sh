#!/bin/sh
docker run --name zanata --link zanatadb:db -p 8080:8080 -it \
    -v $PWD/volumes/zanata:/opt/jboss/zanata \
    zanata/server
