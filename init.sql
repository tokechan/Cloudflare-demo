DROP TABLE IF EXISTS posts;
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY,
    title TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO posts (id, title, content) VALUES 
(1, 'Hello World', 'This is a test post'),
(2, 'Hello World 2', 'This is a test post 2'),
(3, 'Hello World 3', 'This is a test post 3');
