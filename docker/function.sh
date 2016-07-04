#!/bin/bash -xeu

function chcon_exec(){
    case `uname` in
	Darwin )
	    # mac OS has neither SELinux nor chcon
	    return
	    ;;
	Linux )
	    # non root SELinux confined user need sudo
	    if [ `id -u` -ne 0 ];then
		if ! (id -Z | grep "unconfined_t");then
		    sudo chcon $@
		    return
		fi
	    fi
	    chcon $@
	    return
	    ;;
	* )
	    return
	    ;;
    esac
}

function dir_setup_for_docker(){
    local dir="$1"
    mkdir -p "$dir"
    chcon_exec -Rt svirt_sandbox_file_t "$dir"
}

function file_setup_for_docker(){
    local f="$1"
    local dir=$(dirname "$f")
    dir_setup_for_docker "$dir"
    chcon_exec -Rt svirt_sandbox_file_t "$f"
}
