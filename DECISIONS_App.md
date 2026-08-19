# Entscheidungen

> Vorlage für Teil 4 der Aufgabe. Ein bis maximal zwei Seiten, formlos, Stichpunkte
> genügen völlig. Dieses Dokument ist uns wichtiger als ein paar Zeilen Code mehr –
> hier sehen wir, wie du denkst. Gerne beim Arbeiten nebenher ausfüllen.
> Die Zitat-Hinweise bitte einfach löschen.

**Tatsächlicher Zeitaufwand:** _z. B. 2 h 50 min_

---

## 1. Was ist mir im Ausgangscode aufgefallen?

> Kurzliste genügt. Gerne mit Einschätzung: kritisch / ärgerlich / Kosmetik.

- Kritisch (Race Conditions): Durch die asynchrone Natur und die künstliche 400ms-Latenz des Servers konnten bei schnellem Tippen ältere HTTP-Antworten neuere überschreiben, was zu einem inkonsistenten UI-Zustand führte.

- Kritisch (Zustandsverwaltung): Der State war lokal in der Komponente gefangen. Ein Reload der Seite oder das Teilen eines Links mit gesetzten Filtern war nicht möglich.

- Ärgerlich (Fehlerbehandlung): Es gab kein resilientes Konzept für den Flaky-Modus (FLAKY=1); fehlschlagende Requests ließen die UI in einem endlosen Ladezustand oder defekten Zustand zurück.

- Kritisch/A11y (Barrierefreiheit): Interaktive Tabellenköpfe hatten keine semantische Auszeichnung (aria-sort), Statusinformationen waren rein visuell (Farbe) kodiert und Screenreader wurden nicht über asynchrone Ladezustände informiert.

## 2. Was habe ich behoben – und was bewusst nicht?

> Interessant ist vor allem die zweite Hälfte: Was hast du gesehen, aber liegen
> gelassen, und warum war das die richtige Entscheidung für diese drei Stunden?

**Behoben:**

- State Management: Radikale Umstellung auf die URL (Query-Parameter) als "Single Source of Truth". RxJS synchronisiert die UI strikt mit der Route.
- Asynchronität: Einsatz von RxJS switchMap, um In-Flight-Requests bei neuen Parametern sofort abzubrechen und Race Conditions zu eliminieren. Die API wird zusätzlich durch debounceTime(300) beim Suchen geschützt.
- A11y: Die Liste ist nun eine vollwertige, semantische <table> mit aria-sort für Tastaturnavigation. Visuelle Status-Badges wurden durch Screenreader-lesbaren Text ergänzt (aria-live).
- Backend-Testbarkeit: Die Filter-, Sortier- und Paginierungslogik wurde in einen reinen DeviceQueryService ausgelagert, der nur Arrays verarbeitet und unabhängig von Express testbar ist.

**Bewusst liegen gelassen:**

- Komplexe State-Management-Bibliotheken (z. B. NgRx): Für diese Anforderung reines Overengineering. Die Kombination aus URL-Parametern und Angular Signals reicht völlig aus und hält die Bundle-Size klein.

- 100% Testabdeckung / E2E-Tests: Aus Zeitgründen wurden nur die kritischen Pfade (Service-Logik, RxJS-Pipeline) getestet, anstatt Zeit in umfangreiche Cypress-Setups zu investieren.

## 3. Architektur und Trade-offs

> Welche Entscheidung war nicht eindeutig, und wogegen hast du dich entschieden?
> Was hält, wenn die Liste morgen 2 Millionen Geräte hat oder drei weitere Teams die
> Komponente mitbenutzen – und was fällt dann als Erstes um?

- Trade-off (CORS & Workspace-Trennung): Anstatt das Backend und Frontend in einem einzigen npm-Projekt zu mischen, habe ich mich für eine strikte DDD-Trennung mit isolierten package.json-Abhängigkeiten entschieden. Um CORS-Fehler in der Entwicklung zu vermeiden, wird ein Proxy in der angular.json (proxy.conf.json) genutzt, der Anfragen an http://localhost:3000 tunnelt. Dies spiegelt ein realistisches Produktions-Setup wider.

- Skalierbarkeit (2 Millionen Geräte): Der aktuelle DeviceQueryService filtert und sortiert im Node.js-Arbeitsspeicher. Bei 25.000 Geräten benötigt das nur wenige Megabyte RAM und O(N log N) Zeit. Wenn die Liste auf 2 Millionen Geräte anwächst, würde das Node-Event-Loop blockieren und zu Timeouts führen. Die Architektur ist aber so gekapselt, dass der Service problemlos ausgetauscht werden kann: Die Logik müsste dann zwingend in eine Datenbank (z.B. PostgreSQL) verlagert werden, die serverseitige Cursor-basierte Paginierung und indizierte Suchanfragen (locationId, status) übernimmt.

- Lookup-Optimierung: Im Backend-Service werden die Standorte einmalig in eine Map geladen (Trade-off: O(L) Speicherplatz), um beim Paginieren eine O(1)-Zuordnung der locationName zu gewährleisten, statt bei jedem Gerät das Array zu durchsuchen.

## 4. Tests

> Warum genau diese Stellen? Was hättest du als Nächstes abgesichert?

- Backend (devices.service.spec.js): Getestet wurde gezielt die Abfrageschicht (Grenzfälle wie ungültige Sortierfelder, negative Paginierung, leere Suchergebnisse). Warum? Weil hier die Business-Logik sitzt. Fehler hier eskalieren auf alle Clients.

- Frontend: Getestet wurde der Umgang mit der künstlichen Latenz und dem Fehlerzustand (FLAKY=1). Es musste sichergestellt werden, dass switchMap alte Requests korrekt abräumt.

- Nächster Schritt: Bei mehr Zeit hätte ich DOM-Tests für die Barrierefreiheit (z.B. mit axe-core) implementiert, um sicherzustellen, dass interaktive Elemente stets zugänglich bleiben.

## 5. Womit bin ich nicht zufrieden?

> Ehrliche Antworten sind hier ein Pluspunkt, kein Risiko.

- Die Paginierungs-UI (Next/Prev-Buttons) ist aktuell sehr rudimentär. Für ein Tool, das den ganzen Tag genutzt wird, wäre eine vollständige Seitennavigation inklusive Berechnung der "Total Pages" aus dem API-Response (total) nutzerfreundlicher.
- Die URL-Struktur kann bei sehr komplexen Filterkombinationen unübersichtlich werden.
