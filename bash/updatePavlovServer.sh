#!/bin/bash
#Changes value in game ini

systemctl stop pavlov
sudo apt update
sudo apt install -y gdb curl lib32gcc1 libc++-dev unzip
sudo su -l steam
~/Steam/steamcmd.sh +login anonymous +force_install_dir /home/steam/pavlovserver +app_update 622970 -beta shack +exit
~/Steam/steamcmd.sh +login anonymous +app_update 1007 +quit
exit
sh /root/horde/bash/changeGameINI.sh
systemctl start pavlov