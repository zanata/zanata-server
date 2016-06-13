#!/bin/bash
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
ZANATA_DIR=$HOME/zanata
mkdir $ZANATA_DIR
# chown -R 1000:1000 $ZANATA_DIR
# make zanata directory accessible to docker containers (SELinux)
chcon -Rt svirt_sandbox_file_t $ZANATA_DIR

docker run --rm --name zanata --link zanatadb:db -p 8080:8080 -it \
    -v $ZANATA_WAR:/opt/jboss/wildfly/standalone/deployments/ROOT.war \
    -v $ZANATA_DIR:/opt/jboss/zanata \
    zanata/server
