/* This is used when the database is first initalized and prepped for prod */

CREATE TABLE IF NOT EXISTS playerData (
    username VARCHAR(255),
    balance NUMERIC DEFAULT 1000,
    id PRIMARY KEY,
    plinkoPlayed integer DEFAULT 0,
    coinFlipPlayed integer DEFAULT 0,
    wheelOfFortunePlayed integer DEFAULT 0
);

INSERT INTO playerData (username, id) 
VALUES ('exampleUser', 1234);
