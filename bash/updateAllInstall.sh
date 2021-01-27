#!/bin/bash

install_service() {
    hordeBashDir="/root/horde/bash"
    serviceName=$1
    serviceFile="$serviceName.service"
    scriptFile="$serviceName.sh"
    systemctl stop $serviceName
    systemctl disable $serviceName
    echo "copying $hordeBashDir/$serviceFile to /etc/systemd/system/$serviceFile"
    cp $hordeBashDir/$serviceFile /etc/systemd/system/$serviceFile
    systemctl enable $serviceName
    systemctl start $serviceName
}

install_service "updateAll"