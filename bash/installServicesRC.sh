#!/bin/bash
#Installs All Services

sudo apt-get update -y
sudo apt-get install -y unzip
sudo apt-get install -y jq

install_service() {
    echo "Installing $1 service..."
    hordeBashDir="/root/horde/bash"
    serviceName=$1
    serviceFile="$serviceName.service"
    systemctl disable $serviceName
    systemctl stop $serviceName
    echo "copying $hordeBashDir/$serviceFile to /etc/systemd/system/$serviceFile"
    cp "$hordeBashDir/$serviceFile" /etc/systemd/system/$serviceFile
    systemctl enable $serviceName
    systemctl start $serviceName
}
install_service "pavlov"
install_service "updateAllRC"

install_service "hordeScore"
install_service "apiServer"
install_service "hordeMonitor"