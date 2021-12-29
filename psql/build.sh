vim /etc/postgresql/10/main/postgresql.conf
#listen_addresses = 'localhost'
vim /etc/postgresql/10/main/pg_hba.conf
#ip4
/usr/lib/postgresql/10/bin/pg_ctl -D /etc/postgresql/10/main -l logfile start