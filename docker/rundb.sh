#!/bin/bash -eu

# Change these for different settings
DB_USERNAME=zanata
DB_PASSWORD=zanatapw
DB_SCHEMA=zanata
DB_ROOT_PASSWORD=rootpw

VOLUME_DIR=$HOME/docker-volumes/zanata-mariadb

mkdir -p $VOLUME_DIR
case `uname` in
    Darwin )
        # mac OS has neighter SELinux nor chcon
        ;;
    Linux )
        # non root SELinux confined user need sudo
        SUDO=
        if [ `id -u` -ne 0 ];then
            if ! (id -Z | grep "unconfined_t");then
                SUDO=sudo
            fi
        fi
        $SUDO chcon -Rt svirt_sandbox_file_t $VOLUME_DIR
        ;;
esac


docker run --name zanatadb \
  -e MYSQL_USER=$DB_USERNAME -e MYSQL_PASSWORD=$DB_PASSWORD \
  -e MYSQL_DATABASE=$DB_SCHEMA -e MYSQL_ROOT_PASSWORD=$DB_ROOT_PASSWORD \
  -P \
  -v $VOLUME_DIR:/var/lib/mysql \
  -d mariadb:10.1 \
  --character-set-server=utf8 --collation-server=utf8_general_ci

echo ''
echo 'Please use the command "docker logs zanatadb" to check that MariaDB starts correctly.'
