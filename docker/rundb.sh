#!/bin/bash

# Change these for different settings
DB_USERNAME=zanata
DB_PASSWORD=zanatapw
DB_SCHEMA=zanata
DB_ROOT_PASSWORD=rootpw

docker run --name zanatadb \
  -e MYSQL_USER=$DB_USERNAME -e MYSQL_PASSWORD=$DB_PASSWORD \
  -e MYSQL_DATABASE=$DB_SCHEMA -e MYSQL_ROOT_PASSWORD=$DB_ROOT_PASSWORD \
  -P \
  -v $HOME/docker-volumes/zanata-mariadb:/var/lib/mysql \
  -d mariadb:10.1 \
  --character-set-server=utf8 --collation-server=utf8_general_ci

echo 'Please use the command "docker logs zanatadb" to check that MariaDB starts correctly.'
