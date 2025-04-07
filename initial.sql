CREATE TABLE IF NOT EXISTS playerData (
    username VARCHAR(255),
    balance NUMERIC DEFAULT 1000,
    id SERIAL PRIMARY KEY,
    plinkoPlayed integer DEFAULT 0,
    coinFlipPlayed integer DEFAULT 0,
    wheelOfFortunePlayed integer DEFAULT 0
);

INSERT INTO playerData (username) 
VALUES ('exampleUser');