USE ClothingTestDB;

DROP TABLE IF EXISTS Comment;
DROP TABLE IF EXISTS File;
DROP TABLE IF EXISTS Post;
DROP TABLE IF EXISTS Token;
DROP TABLE IF EXISTS Category;
DROP TABLE IF EXISTS User;

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
    user_id INT(11) UNSIGNED NOT NULL,
    FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE,
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
    user_id INT(11) UNSIGNED NOT NULL,
    category VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (category) REFERENCES Category(title) ON DELETE CASCADE,
    PRIMARY KEY(id)
);

CREATE TABLE File(
    id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    filename VARCHAR(100) NOT NULL,
    mimetype VARCHAR(20) NOT NULL,
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
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    user_id INT(11) UNSIGNED NOT NULL,
    post_id INT(11) UNSIGNED NOT NULL,
    FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES Post(id) ON DELETE CASCADE,
    PRIMARY KEY(id)
);

INSERT INTO User (username,userid,email,authority,password) VALUES ('관리자0','admin0','admin0@gmail.com','ADMINISTRATOR',123);
INSERT INTO Category (title) VALUES ('복식사');
INSERT INTO Category (title) VALUES ('복식미학 · 패션디자인');
INSERT INTO Category (title) VALUES ('패션마케팅 · 심리');
INSERT INTO Category (title) VALUES ('복식일반 의복구성 · 텍스타일');