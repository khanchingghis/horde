#!/bin/bash
#Wipes Logs

logFile="/home/steam/pavlovserver/Pavlov/Saved/Logs/Pavlov.log"
logFile2="/home/steam/pavlovserver/Pavlov/Saved/Logs/Pavlov_2.log"
backupLogsDir="/home/steam/pavlovserver/Pavlov/Saved/Logs/"
echo "Cleaning $logFile"
:>$logFile
:>$logFile2
rm -r "$backupLogsDir"Pavlov-backup-*
rm -r "$backupLogsDir"Pavlov_2-backup-*