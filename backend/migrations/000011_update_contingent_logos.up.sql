-- Migration 000011: Update logo_url resmi untuk 14 Kontingen Kabupaten/Kota se-Kalimantan Tengah
UPDATE contingents SET logo_url = '/logos/kobar.png' WHERE id = 1 OR short_code = 'KOBAR';
UPDATE contingents SET logo_url = '/logos/kotim.png' WHERE id = 2 OR short_code = 'KOTIM';
UPDATE contingents SET logo_url = '/logos/plk.png' WHERE id = 3 OR short_code = 'PLK';
UPDATE contingents SET logo_url = '/logos/kps.png' WHERE id = 4 OR short_code = 'KPS';
UPDATE contingents SET logo_url = '/logos/barsel.png' WHERE id = 5 OR short_code = 'BARSEL';
UPDATE contingents SET logo_url = '/logos/barut.png' WHERE id = 6 OR short_code = 'BARUT';
UPDATE contingents SET logo_url = '/logos/bartim.png' WHERE id = 7 OR short_code = 'BARTIM';
UPDATE contingents SET logo_url = '/logos/mura.png' WHERE id = 8 OR short_code = 'MURA';
UPDATE contingents SET logo_url = '/logos/ktn.png' WHERE id = 9 OR short_code = 'KTN';
UPDATE contingents SET logo_url = '/logos/sry.png' WHERE id = 10 OR short_code = 'SRY';
UPDATE contingents SET logo_url = '/logos/pulpis.png' WHERE id = 11 OR short_code = 'PULPIS';
UPDATE contingents SET logo_url = '/logos/gmas.png' WHERE id = 12 OR short_code = 'GMAS';
UPDATE contingents SET logo_url = '/logos/skm.png' WHERE id = 13 OR short_code = 'SKM';
UPDATE contingents SET logo_url = '/logos/lmd.png' WHERE id = 14 OR short_code = 'LMD';

