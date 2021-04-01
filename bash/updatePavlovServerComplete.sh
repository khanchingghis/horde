#!/bin/bash

systemctl stop pavlov
sudo apt update
sudo apt install -y gdb curl lib32gcc1 libc++-dev unzip
sudo -u steam /root/horde/bash/updatePavlovServer.sh
/root/horde/bash/changeGameINI.sh
systemctl start pavlov