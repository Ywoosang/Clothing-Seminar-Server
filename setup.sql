DROP DATABASE IF EXISTS ClothingDB;
CREATE DATABASE ClothingDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
USE ClothingDB;

DROP TABLE IF EXISTS Comment;
DROP TABLE IF EXISTS File;
DROP TABLE IF EXISTS Post;
DROP TABLE IF EXISTS Token;
DROP TABLE IF EXISTS Category;
DROP TABLE IF EXISTS User;

SET GLOBAL time_zone='Asia/Seoul';
set time_zone='Asia/Seoul';

CREATE TABLE User(
    id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(10) NOT NULL,
    userid VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(30) NOT NULL UNIQUE,
    authority VARCHAR(15) NOT NULL DEFAULT 'MEMBER', 
    password VARCHAR(200) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE Token(
    refresh_token VARCHAR(200) NOT NULL, 
    owner_id INT(11) UNSIGNED NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES User(id) ON DELETE CASCADE,
    PRIMARY KEY(refresh_token)
);

CREATE TABLE Category(
    title VARCHAR(50) NOT NULL,
    PRIMARY KEY(title)
);

CREATE TABLE Post(
    id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    title VARCHAR(30) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NULL,
    views INT(11) UNSIGNED NOT NULL DEFAULT 0,
    copyright_holder VARCHAR(20) NOT NULL,
    owner_id INT(11) UNSIGNED NOT NULL,
    category VARCHAR(50) NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (category) REFERENCES Category(title) ON DELETE CASCADE,
    PRIMARY KEY(id)
);

CREATE TABLE File(
    id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    filename VARCHAR(100) NOT NULL,
    url VARCHAR(300) NOT NULL,
    owner_id INT(11) UNSIGNED NOT NULL,
    post_id INT(11) UNSIGNED NOT NULL, 
    awsKey VARCHAR(150) NOT NULL,
    FOREIGN KEY(owner_id) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY(post_id) REFERENCES Post(id) ON DELETE CASCADE,
    PRIMARY KEY(id)
);

CREATE TABLE Comment(
    id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    copyright_holder VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    post_id INT(11) UNSIGNED NOT NULL,
    password INT (20) UNSIGNED NOT NULL,
    FOREIGN KEY (post_id) REFERENCES Post(id) ON DELETE CASCADE,
    PRIMARY KEY(id)
);

INSERT INTO User (username,userid,email,authority,password) VALUES ('윤우상','root','admin0@gmail.com','ROOT',123);
INSERT INTO User (username,userid,email,authority,password) VALUES ('관리자1','admin1','admin1@gmail.com','ADMINISTER',1234);
INSERT INTO User (username,userid,email,authority,password) VALUES ('관리자2','admin2','admin2@gmail.com','ADMINISTER',1234);
INSERT INTO User (username,userid,email,authority,password) VALUES ('관리자3','admin3','admin3@gmail.com','ADMINISTER',1234);
INSERT INTO User (username,userid,email,authority,password) VALUES ('관리자4','admin4','admin4@gmail.com','ADMINISTER',1234);
INSERT INTO User (username,userid,email,authority,password) VALUES ('관리자5','admin5','admin5@gmail.com','ADMINISTER',1234);

INSERT INTO Category (title) VALUES ('History of Costume');
INSERT INTO Category (title) VALUES ('Aesthetics · Fashion Design');
INSERT INTO Category (title) VALUES ('Fashion Marketing · Psychology');
INSERT INTO Category (title) VALUES ('Clothing Construction · Textiles · General Costume');