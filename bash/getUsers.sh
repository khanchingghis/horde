journalctl -u pavlov | awk -F '(RemoteAddr: |, Name:|UniqueId: NULL:)' '/UChannel::Close/{
    split($2,a,":"); 
    if(!seen[a[1]$4]++) print a[1], "-", $4}'