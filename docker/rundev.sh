#!/bin/bash -xeu

# determine directory containing this script
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
    DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
    SOURCE="$(readlink "$SOURCE")"
    [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"

# change to top of the git working directory
cd $DIR/../
ZANATA_WAR=$(echo $PWD/zanata-war/target/zanata-*.war)
# volume mapping for zanata server files
ZANATA_DIR=$HOME/docker-volumes/zanata

# create the data directory
mkdir -p $ZANATA_DIR

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
        # make zanata directory and standalone.xml file accessible to docker containers (SELinux)
        $SUDO chcon -Rt svirt_sandbox_file_t "$ZANATA_DIR"
        $SUDO chcon -Rt svirt_sandbox_file_t "$ZANATA_WAR"
        ;;
esac


# build the docker dev image
docker build -t zanata/server-dev docker/

# runs zanata/server-dev:latest docker image
docker run --rm --name zanata --link zanatadb:db -p 8080:8080 -it \
    -v $ZANATA_WAR:/opt/jboss/wildfly/standalone/deployments/ROOT.war \
    -v $ZANATA_DIR:/opt/jboss/zanata \
    zanata/server-dev
