#!/bin/bash

echo '컨테이너 확인'
PROC_ID=$(docker ps | grep clothingdb)
if [ -n "${PROC_ID}" ];
then
 echo '컨테이너 종료'
 docker stop clothingdb
 docker rm clothingdb
else
 echo "존재하지 않는 컨테이너"
fi
echo 'Docker Build Starting..'
docker build -t clothing .
echo 'Build Success'
echo 'Docker Container Starting..'
docker run -d --name clothingdb -e MYSQL_ROOT_PASSWORD=db11 \
-p 3306:3306 --restart=always \
clothing --character-set-server=utf8 \
--collation-server=utf8_unicode_ci
echo 'clothingdb Container Started' 
docker exec -it clothingdb bash 
