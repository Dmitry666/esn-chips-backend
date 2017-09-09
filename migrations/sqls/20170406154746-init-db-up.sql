CREATE TABLE chip (
    id serial NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    icon text NOT NULL,
	CONSTRAINT pk__interview PRIMARY KEY (id)
);

CREATE TABLE chip_user (
	chip_id integer NOT NULL,
	user_id integer NOT NULL,
	count integer NOT NULL DEFAULT '0',
	CONSTRAINT pk__chip_user PRIMARY KEY (chip_id, user_id),
	CONSTRAINT fk__chip_user__interview FOREIGN KEY (chip_id)
		REFERENCES chip(id) MATCH SIMPLE
		ON UPDATE RESTRICT ON DELETE RESTRICT
);
