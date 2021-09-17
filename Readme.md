# KSC International Conference (KSCIC) 2021

- Back: Node.js, Express, TypeScript
- Testing : Jest, Supertest, Docker 
- Deploy : AWS CLI, AWS Elastic Beanstalk, AWS EC2, AWS RDS

# Develop Setting

개발 및 테스트시 Docker 이용
```bash
# 쉘 스크립트 권한 확인
sudo chmod +x setup.sh
# 빌드 및 컨테이너 실행
./setup.sh

# 컨테이너로부터 데이터베이스 백업 SQL 파일 생성
$ docker exec clothingdbsh -c 'exec mysqldump --databases clothingdb_dev -uroot -p"<your-password>"' > "<path-on-your-host>/backup.sql"
 
# 컨테이너에 데이터베이스 백업 파일 적용
$ docker exec -i clothingdb sh -c 'exec mysql -uroot -p"<your-password>"' <  "<path-on-your-host>/backup.sql"
```

