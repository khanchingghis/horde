#!/bin/bash
#Installs Service

thisDir=$(dirname "$0")
serviceName="postPlayersMonitor"
serviceFile="$serviceName.service"
scriptFile="$serviceName.sh"
cp $thisDir/$serviceFile /etc/systemd/system/$serviceFile
cp $thisDir/$scriptFile /home/steam/pavlovserver/$scriptFile
systemctl enable $serviceName
systemctl start $serviceName