docker run -it \
    --link zanatadb:mysql --rm mariadb sh \
    -c 'exec mysql --protocol=tcp -h"$MYSQL_PORT_3306_TCP_ADDR" -P"$MYSQL_PORT_3306_TCP_PORT" -uzanata -ppassword zanata > conf/admin-user-setup.sql'
