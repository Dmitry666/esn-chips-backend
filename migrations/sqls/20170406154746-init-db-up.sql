CREATE TABLE food (
    id serial NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    icon text NOT NULL,
	CONSTRAINT pk__chip PRIMARY KEY (id)
);

CREATE TABLE chip_user (
	food_id integer NOT NULL,
	user_id integer NOT NULL,
	count integer NOT NULL DEFAULT '0',
	CONSTRAINT pk__food_user PRIMARY KEY (food_id, user_id),
	CONSTRAINT fk__food_user__chip FOREIGN KEY (food_id)
		REFERENCES chip(id) MATCH SIMPLE
		ON UPDATE RESTRICT ON DELETE RESTRICT
);

CREATE TABLE dino (
    id serial NOT NULL,
    angry real NOT NULL DEFAULT '0',
    hungry real NOT NULL DEFAULT '1',
    sleep real NOT NULL DEFAULT '0',
    level integer NOT NULL DEFAULT '0',
	CONSTRAINT pk__dino PRIMARY KEY (id)
);