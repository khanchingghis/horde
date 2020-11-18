#!/bin/bash

hordeBashDir="/root/horde/bash"
serviceName="hordeScore"
serviceFile="$serviceName.service"
scriptFile="$serviceName.sh"
echo "copying $hordeBashDir/$serviceFile to /etc/systemd/system/$serviceFile"
cp $hordeBashDir/$serviceFile /etc/systemd/system/$serviceFile
systemctl stop $serviceName
systemctl enable $serviceName
systemctl start $serviceName