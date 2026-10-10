# Digital Vision AgenturCRM

Lokale CRM-Web-App fuer Leads, Pipeline, Aufgaben, CSV-Import/Export und JSON-Backups.

## Start

Oeffne `index.html` direkt im Browser. Die Daten werden im LocalStorage des Browsers gespeichert.

## CSV Import

Unterstuetzte Spalten:

```text
name,company,email,phone,status,service,source,priority,value,probability,nextAction,nextActionDate,notes
```

Alternativ erkennt der Import fuer Kontakt und Firma auch `Kontakt` und `Firma`.

## Hinweis

Das System laeuft ohne Server und ohne externe Datenbank. Fuer mehrere Nutzer, Rollen, Login oder Team-Synchronisierung waere der naechste Schritt ein Backend mit Datenbank.
