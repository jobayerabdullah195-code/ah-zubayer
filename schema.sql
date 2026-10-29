CREATE TABLE IF NOT EXISTS visits(id INTEGER PRIMARY KEY AUTOINCREMENT,vid TEXT,sid TEXT,path TEXT,referrer TEXT,country TEXT,city TEXT,device TEXT,browser TEXT,os TEXT,ip_hash TEXT,duration INTEGER DEFAULT 0,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS i_v_date ON visits(created_at);
CREATE TABLE IF NOT EXISTS messages(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT,email TEXT,body TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS posts(id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT,excerpt TEXT,body TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS audits(id INTEGER PRIMARY KEY AUTOINCREMENT,url TEXT,score INTEGER,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
INSERT INTO posts(title,excerpt,body) VALUES('Welcome to my blog','Notes on building fast, clean websites.','This is your first post. Delete or edit it from the admin panel at /admin/.');
