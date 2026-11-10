ALTER TABLE venues
    ALTER COLUMN latitude TYPE NUMERIC,
    ALTER COLUMN longitude TYPE NUMERIC;

UPDATE venues
SET latitude = -2.687807488510188,
    longitude = 111.63072492325624
WHERE name = 'GOR KONI';

UPDATE venues
SET latitude = -2.7198037755266635,
    longitude = 111.63115888357069
WHERE name IN ('Sport Center', 'Sport Center Pangkalan Bun');
