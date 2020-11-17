#!/bin/bash
#Installs All Services

sudo apt-get update -y
sudo apt-get install -y unzip
sudo apt-get install -y jq

echo "Installing Node..."
hordeNodeDir="/root/horde/node"
cd $hordeNodeDir
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y npm

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
install_service "pavlov"
install_service "hordeScore"