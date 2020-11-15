#!/bin/bash
#Installs All Services

sudo apt-get update -y
sudo apt-get install -y unzip
sudo apt-get install -y jq

hordeBashDir="/root/horde/bash"
serviceName="updateAll"
serviceFile="$serviceName.service"
scriptFile="$serviceName.sh"
echo "copying $hordeBashDir/$serviceFile to /etc/systemd/system/$serviceFile"
cp $hordeBashDir/$serviceFile /etc/systemd/system/$serviceFile
systemctl enable $serviceName
systemctl start $serviceName

hordeBashDir="/root/horde/bash"
serviceName="pavlov"
serviceFile="$serviceName.service"
scriptFile="$serviceName.sh"
echo "copying $hordeBashDir/$serviceFile to /etc/systemd/system/$serviceFile"
cp $hordeBashDir/$serviceFile /etc/systemd/system/$serviceFile
systemctl enable $serviceName
systemctl restart $serviceName

hordeBashDir="/root/horde/bash"
serviceName="postPlayersMonitor"
serviceFile="$serviceName.service"
scriptFile="$serviceName.sh"
echo "copying $hordeBashDir/$serviceFile to /etc/systemd/system/$serviceFile"
cp $hordeBashDir/$serviceFile /etc/systemd/system/$serviceFile
systemctl enable $serviceName
systemctl start $serviceName