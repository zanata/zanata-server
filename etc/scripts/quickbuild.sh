#!/bin/bash
#set -x

gwtMode="-Dchromefirefox"
while getopts "cfh" opt; do
  case ${opt} in
    c)
      gwtMode="-Dchrome"
      echo ">> Building GWT for Google Chrome"
      ;;
    f)
      gwtMode="-Dfirefox"
      echo ">> Building GWT for Mozilla Firefox"
      ;;
    h)
      echo ">> Run this script to quickly build the Zanata web archive" >&2
      echo ">>>> -c Only build GWT components for Chrome" >&2
      echo ">>>> -f Only build GWT components for Firefox" >&2
      exit 0;
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1;
      ;;
  esac
done

DIR="$( cd -P "$( dirname "$0" )" && pwd )"
cd $DIR/../..
mvn -DskipArqTests -DskipUnitTests -Danimal.sniffer.skip $gwtMode -am -pl zanata-war package
