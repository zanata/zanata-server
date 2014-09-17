#!/bin/bash -e

source etc/scripts/allocate-jboss-ports
exec mvn "$@"
