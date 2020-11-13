#!/bin/bash
#Installs Service

hordeBashDir="/root/horde/bash"
serviceName="updateAll"
serviceFile="$serviceName.service"
scriptFile="$serviceName.sh"
echo "copying $hordeBashDir/$serviceFile to /etc/systemd/system/$serviceFile"
cp $hordeBashDir/$serviceFile /etc/systemd/system/$serviceFile
systemctl enable $serviceName
systemctl start $serviceName