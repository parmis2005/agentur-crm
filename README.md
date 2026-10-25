# Digital Vision AgenturCRM

Lokale CRM-Web-App für Leads, Pipeline, Aufgaben, CSV-Import/Export und JSON-Backups.

## Start

```bash
npm run dev
```

Danach öffne `http://localhost:3000`. Die Daten werden im LocalStorage des Browsers gespeichert.

## CSV Import

Unterstützte Spalten:

```text
name,company,email,phone,status,service,source,priority,value,probability,nextAction,nextActionDate,notes
```

Alternativ erkennt der Import für Kontakt und Firma auch `Kontakt` und `Firma`.

## Hinweis

Das System läuft ohne Server und ohne externe Datenbank. Für mehrere Nutzer, Rollen, Login oder Team-Synchronisierung wäre der nächste Schritt ein Backend mit Datenbank.
