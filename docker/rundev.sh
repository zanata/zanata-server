#!/bin/bash -xeu

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

# change to top of the git working directory
TOP_DIR="$DIR/../"

if [ -r $TOP_DIR/zanata-war/target/zanata.war ];then
    # use zanata.war if it exists
    ZANATA_WAR=$TOP_DIR/zanata-war/target/zanata.war
else
    # Multiple war files handling
    ZANATA_WAR_BUFFER=$(find $TOP_DIR/zanata-war/target -name "zanata*.war")
    result=$(wc -l << $ZANATA_WAR_BUFFER)
    if [ $(result) -gt 1 ];then
	echo "[ERROR] Multiple war files found: $ZANATA_WAR_BUFFER" > /dev/stderr
	exit 1
    elif [ $(result) -lt 1 ];then
	echo "[ERROR] No war files found" > /dev/stderr
	exit 1
    fi
    ZANATA_WAR=$ZANATA_WAR_BUFFER
fi
file_setup_for_docker "$ZANATA_WAR"

# volume mapping for zanata server files
ZANATA_DIR=$HOME/docker-volumes/zanata
dir_setup_for_docker "$ZANATA_DIR"

# build the docker dev image
cd $TOP_DIR
docker build -t zanata/server-dev docker/

# runs zanata/server-dev:latest docker image
docker run --rm --name zanata --link zanatadb:db \
    -p 8080:8080 -p 8787:8787 -it \
    -v $ZANATA_WAR:/opt/jboss/wildfly/standalone/deployments/ROOT.war \
    -v $ZANATA_DIR:/opt/jboss/zanata \
    zanata/server-dev
