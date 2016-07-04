#!/bin/bash -eu

# Change these for different settings
DB_USERNAME=zanata
DB_PASSWORD=zanatapw
DB_SCHEMA=zanata
DB_ROOT_PASSWORD=rootpw

VOLUME_DIR=$HOME/docker-volumes/zanata-mariadb

# determine directory containing this script
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
    DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
    SOURCE="$(readlink "$SOURCE")"
    # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
    [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE" 
done
DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
source $DIR/function.sh

dir_setup_for_docker "$VOLUME_DIR"

docker run --name zanatadb \
  -e MYSQL_USER=$DB_USERNAME -e MYSQL_PASSWORD=$DB_PASSWORD \
  -e MYSQL_DATABASE=$DB_SCHEMA -e MYSQL_ROOT_PASSWORD=$DB_ROOT_PASSWORD \
  -P \
  -v $VOLUME_DIR:/var/lib/mysql \
  -d mariadb:10.1 \
  --character-set-server=utf8 --collation-server=utf8_general_ci

echo ''
echo 'Please use the command "docker logs zanatadb" to check that MariaDB starts correctly.'
