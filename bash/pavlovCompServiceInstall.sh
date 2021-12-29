#!/bin/bash
#Installs Service


systemctl stop pavlov
systemctl disable pavlov

install_service() {
    echo "Installing $1 service..."
    hordeBashDir="/root/horde/bash"
    sourceServiceName=$1
    sourceServiceFile="$sourceServiceName.service"

    destServiceName=$2
    destServiceFile="$destServiceName.service"

    systemctl disable $destServiceName
    systemctl stop $destServiceName

    echo "copying $hordeBashDir/$sourceServiceFile to /etc/systemd/system/$destServiceFile"
    cp "$hordeBashDir/$sourceServiceFile" /etc/systemd/system/$destServiceFile

    systemctl enable $destServiceName
    systemctl start $destServiceName
}

install_service "pavlovComp" "pavlov"