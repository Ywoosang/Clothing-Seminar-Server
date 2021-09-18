#!/bin/bash

echo '✨ check container process.. 🤔'
PROC_ID=$(docker ps | grep clothingdb)
if [ -n "${PROC_ID}" ];
then
 echo '✨ stop container clothingdb.. 🐳'
 docker stop clothingdb
 docker rm clothingdb
 echo '✨ conatiner process down ✅'
else
 echo "✨ container clothingdb not exist"
fi
echo '✨ docker build starting.. 🐳'
docker build -t clothing .
echo '✨ build success ✅'
echo '✨ container starting.. 🐳'
docker run -d --name clothingdb -e MYSQL_ROOT_PASSWORD=db11 \
-p 3306:3306 --restart=always \
clothing --character-set-server=utf8 \
--collation-server=utf8_unicode_ci
echo '✨ mysql process starting.. 👻'
sleep 10s 
echo '✨ exec setup.sql.. 😶' 
docker exec -i clothingdb sh -c 'exec mysql -uroot -p"db11"' <  ./setup.sql
echo '✨ sql script applied successfully ✅' 
echo '✨ open bash script 🖥'
docker exec -it clothingdb bash

