CREATE SCHEMA a17;

CREATE TABLE a17.user
(
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(80) NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  password_salt TEXT        NOT NULL,
  api_key       TEXT        NOT NULL
);

CREATE TYPE a17.USER_DETAILS AS (
  id                INT,
  username          VARCHAR(80),
  api_key           TEXT,
  is_password_valid BOOLEAN
);

CREATE OR REPLACE FUNCTION a17.create_new_user(login VARCHAR(80), password VARCHAR(70))
  RETURNS TEXT AS $$
DECLARE
  salt              TEXT;
  generated_api_key TEXT;
BEGIN
  IF length(password) < 8
  THEN
    RAISE 'Password must be longer';
  END IF;

  salt := gen_salt('bf');

  INSERT INTO a17.user (username, password_hash, password_salt, api_key)
  VALUES (login, crypt(password, salt), salt, gen_random_uuid() :: TEXT)
  RETURNING api_key
    INTO generated_api_key;
  RETURN generated_api_key;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION a17.validate_user(login VARCHAR(80), password VARCHAR(70), key TEXT)
  RETURNS a17.USER_DETAILS AS $$
SELECT
  u.id,
  u.username,
  u.api_key,
  (u.password_hash = crypt(password, u.password_salt)) AS is_password_valid
FROM a17.user AS u
WHERE u.username = login AND u.api_key = key;
$$ LANGUAGE SQL;