UPDATE venues
SET latitude = -2.6785645,
    longitude = 111.6376259
WHERE name = 'GOR KONI';

UPDATE venues
SET latitude = -2.6745645,
    longitude = 111.6356259
WHERE name = 'Sport Center';

ALTER TABLE venues
    ALTER COLUMN latitude TYPE DECIMAL(10, 7),
    ALTER COLUMN longitude TYPE DECIMAL(10, 7);
