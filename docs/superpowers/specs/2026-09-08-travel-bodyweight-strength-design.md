# Reise-Krafttraining mit Vektoranimationen

## Ziel

openGym erhält einen global verfügbaren, deutschsprachigen Katalog mit 48
Kraftübungen für Reisen. Jede Übung funktioniert ohne Geräte in einem kleinen
Zimmer und benötigt höchstens freien Boden oder eine Wand. Alle Profile können
die Übungen in der Bibliothek finden, in Pläne übernehmen, protokollieren und in
geteilten Plänen verwenden.

Die Darstellung wird vollständig als Code im Frontend erzeugt. Es werden keine
KI-Bilder, GIFs, Videos, externen CDNs oder API-Schlüssel benötigt. Dieselben
Bewegungsdaten liefern eine ruhende Vorschau in Listen und eine kurze,
kontrollierbare SVG-Animation in der Übungsansicht.

## Freigegebene Produktentscheidungen

1. Der Schwerpunkt ist Krafttraining, nicht Cardio oder Mobility.
2. Der Katalog umfasst genau 48 Übungen für gemischte Leistungsniveaus.
3. Zulässige Umgebung: Boden und Wand; keine Möbel und keine Trainingsgeräte.
4. Die Übungen sind als fest eingebauter globaler Katalog für alle Profile
   verfügbar, nicht als persönliche Custom Exercises.
5. Namen und Ausführungshinweise sind deutsch.
6. Jede Übung erhält eine programmierte Vektoranimation und ein daraus
   abgeleitetes statisches Vorschaubild.
7. Der bisher getestete halbrealistische Bildstil wird vollständig verworfen.
8. Der KI-Coach bleibt unverändert mit `COACH_DISABLED=1` deaktiviert.

## Visuelle Richtung

Die Übungsdarstellung verwendet eine einheitliche, neutrale Trainingsfigur ohne
Gesicht oder individuelle Identität. Kopf, Oberkörper, Becken und Gliedmaßen
werden als klare, weich gerundete Vektorformen aufgebaut. Die Akzentfarbe folgt
`--acc`; Haut-/Körperflächen und Bekleidung verwenden kontrastfeste neutrale
Farben aus dem bestehenden openGym-Designsystem.

Die Figur steht auf einer zurückhaltenden Bodenlinie. Eine Wandkante erscheint
nur bei Übungen, die eine Wand tatsächlich benötigen. Es gibt keine dekorative
Zimmerkulisse, keine Textlabels im Bild und keine Bewegungsspuren, die die
Silhouette verdecken. Gelenkpositionen und Bewegungsweg sind wichtiger als
fotorealistische Details.

Die Animation zeigt eine kontrollierte Wiederholung in etwa drei bis vier
Sekunden: Startposition, Belastungsphase, Endposition und kontrollierte Rückkehr.
Isometrische Übungen nutzen stattdessen eine ruhige Atem-/Spannungsanzeige, ohne
den Körper sichtbar wackeln zu lassen.

## Katalog

Alle IDs liegen im reservierten Namensraum `travel-strength-001` bis
`travel-strength-048`. `eq` ist immer `body weight`, `collection` immer
`travel-strength`, und `level` ist `beginner`, `intermediate` oder `advanced`.

| ID | Übung | Körperbereich | Hauptziel | Niveau |
| --- | --- | --- | --- | --- |
| 001 | Wand-Kniebeuge | upper legs | quads | Anfänger |
| 002 | Kniebeuge | upper legs | quads | Anfänger |
| 003 | Kniebeuge mit Pause | upper legs | quads | Mittel |
| 004 | Enge Kniebeuge | upper legs | quads | Mittel |
| 005 | Sumo-Kniebeuge | upper legs | adductors | Anfänger |
| 006 | Rückwärts-Ausfallschritt | upper legs | quads | Anfänger |
| 007 | Split Squat | upper legs | quads | Mittel |
| 008 | Seitlicher Ausfallschritt | upper legs | adductors | Mittel |
| 009 | Kosaken-Kniebeuge | upper legs | adductors | Fortgeschritten |
| 010 | Kniebeuge mit Wadenheben | lower legs | calves | Mittel |
| 011 | Hüftknick | upper legs | hamstrings | Anfänger |
| 012 | Einbeiniger Hüftknick | upper legs | hamstrings | Mittel |
| 013 | Beckenheben | upper legs | glutes | Anfänger |
| 014 | Einbeiniges Beckenheben | upper legs | glutes | Mittel |
| 015 | Froschpumpe | upper legs | glutes | Anfänger |
| 016 | Beinbeuger-Walkout | upper legs | hamstrings | Fortgeschritten |
| 017 | Hüftstrecken im Vierfüßlerstand | upper legs | glutes | Anfänger |
| 018 | Seitliches Beinheben im Vierfüßlerstand | upper legs | glutes | Anfänger |
| 019 | Wand-Liegestütz | chest | pectorals | Anfänger |
| 020 | Knie-Liegestütz | chest | pectorals | Anfänger |
| 021 | Liegestütz | chest | pectorals | Mittel |
| 022 | Breiter Liegestütz | chest | pectorals | Mittel |
| 023 | Enger Liegestütz | upper arms | triceps | Mittel |
| 024 | Diamant-Liegestütz | upper arms | triceps | Fortgeschritten |
| 025 | Versetzter Liegestütz | chest | pectorals | Mittel |
| 026 | Archer-Liegestütz | chest | pectorals | Fortgeschritten |
| 027 | Pike-Liegestütz | shoulders | delts | Mittel |
| 028 | Delfin-Liegestütz | shoulders | delts | Mittel |
| 029 | Schulterblatt-Liegestütz | back | serratus anterior | Anfänger |
| 030 | Handstand an der Wand | shoulders | delts | Fortgeschritten |
| 031 | Wandlauf | shoulders | delts | Fortgeschritten |
| 032 | Wandengel | shoulders | delts | Anfänger |
| 033 | Y-Heben in Bauchlage | back | upper back | Anfänger |
| 034 | T-Heben in Bauchlage | back | upper back | Anfänger |
| 035 | W-Heben in Bauchlage | back | upper back | Anfänger |
| 036 | Umgekehrter Schneeengel | back | upper back | Mittel |
| 037 | Superman-Latzug | back | lats | Mittel |
| 038 | Schwimmer in Bauchlage | back | spine | Mittel |
| 039 | Unterarmstütz | waist | abs | Anfänger |
| 040 | Langsamer Bergsteiger | waist | abs | Mittel |
| 041 | Seitstütz | waist | obliques | Mittel |
| 042 | Seitstütz mit Rotation | waist | obliques | Fortgeschritten |
| 043 | Käfer | waist | abs | Anfänger |
| 044 | Diagonales Arm-Bein-Heben | waist | abs | Anfänger |
| 045 | Hohlkörper-Halten | waist | abs | Fortgeschritten |
| 046 | Umgekehrter Crunch | waist | abs | Mittel |
| 047 | Gestrecktes Beinheben | waist | abs | Mittel |
| 048 | Bärenstand mit Schultertippen | waist | abs | Mittel |

Jeder Datensatz enthält zusätzlich `sm` für Sekundärmuskeln, drei bis fünf
kurze deutsche Schritte in `st`, einen knappen Sicherheitshinweis in `desc`
und einen `motion`-Schlüssel. Einseitige Übungen erklären ausdrücklich, dass
beide Seiten trainiert werden.

## Architektur

### Katalogdaten

`src/lib/travel-exercises-data.js` enthält ausschließlich die 48 fachlichen
Datensätze. `src/lib/exercises.js` führt sie vor dem Aufbau von `EXIDX` mit dem
bestehenden Datensatz zusammen. Dadurch funktionieren Pläne, Historie,
Muskelkarten, Progression und Plan-Sharing ohne Sonderpfad. Bestehende IDs und
persönliche Custom Exercises bleiben unverändert.

### Bewegungsdaten

`src/lib/bodyweight-motion-data.js` enthält pro `motion`-Schlüssel eine
normalisierte Folge aus zwei bis vier Posen. Eine Pose beschreibt Gelenkpunkte,
Ansicht, Bodenlinie, optionale Wand und Zeitanteil. Gemeinsame Ausgangsposen
werden wiederverwendet; jede Übung besitzt trotzdem eine explizit prüfbare
Sequenz.

`src/lib/bodyweight-motion.js` validiert und interpoliert diese Daten als reine
Funktionen. Die Interpolation läuft nicht über React-State bei jedem Frame.
Stattdessen erzeugt der Renderer SVG-Animationen, die vom Browser ausgeführt
und über die SVG-Zeitsteuerung pausiert beziehungsweise fortgesetzt werden.

### Renderer und Medienintegration

`src/components/BodyweightMotion.jsx` rendert die Figur, Hintergrundelemente
und zugängliche Beschriftung. Im Modus `thumbnail` wird eine aussagekräftige
Posterpose ohne Animation gezeichnet. Im Modus `player` läuft die Schleife und
kann durch Tippen oder die vorhandene Play/Pause-Steuerung angehalten werden.

`src/components/Media.jsx` wählt künftig drei Pfade:

1. `ex.motion`: neuer SVG-Renderer,
2. `ex.gif`: unveränderte bestehende GIF-/Bilddarstellung,
3. kein Medium: bisheriger Platzhalter beziehungsweise keine große Darstellung.

Die bestehende Minimieren-Einstellung bleibt erhalten. `Thumb` zeigt für
Reiseübungen die Posterpose und für alle bisherigen Übungen weiterhin das Bild.

### Bibliothek und Auswahl

Bibliothek und Exercise Picker erhalten einen Sammlungs-Chip
`Reise-Krafttraining`. Er filtert nach `collection === 'travel-strength'` und
kann mit Suche, Körperbereich und Gerätefilter kombiniert werden. Der aktuelle
Filter wird zurückgesetzt, wenn er durch eine Suche keine gültige Kombination
mehr ergibt. Die Überschrift zählt weiterhin den gesamten eingebauten Katalog.

## Bedienung und Barrierefreiheit

1. Die Animation startet nur in der großen Detail-/Trainingsansicht automatisch.
2. Listenansichten zeigen ausschließlich statische Posterposen.
3. Play/Pause ist ein echtes `button`-Element mit übersetztem `aria-label`;
   Tippen auf die Darstellung bleibt als große Zielzone erhalten.
4. `prefers-reduced-motion: reduce` zeigt die Posterpose und startet keine
   räumliche Bewegung.
5. Wenn der Tab unsichtbar oder die Animation außerhalb des Viewports liegt,
   wird sie pausiert und bei Rückkehr nur dann fortgesetzt, wenn der Benutzer
   sie nicht manuell angehalten hat.
6. Vorder- und Hintergrund erfüllen in hellem und dunklem Design ausreichenden
   Kontrast; die Figur bleibt auch ohne Farbe verständlich.
7. Die SVGs enthalten keine anklickbaren Körperteile und gelangen nicht in die
   Tastaturreihenfolge.

## Leistung und Fehlerverhalten

Es wird keine neue Laufzeitabhängigkeit eingeführt. Bewegungsdaten werden als
JavaScript gebündelt; Thumbnails teilen sich denselben Renderer. Nur sichtbare
große Animationen laufen. Fehlende oder ungültige Bewegungsdaten führen zu
einem statischen neutralen Übungsplatzhalter und dürfen die Bibliothek nicht
abstürzen lassen. Bestehende GIF-Medien bleiben vollständig kompatibel.

## Tests und Abnahmekriterien

1. Ein Integritätstest bestätigt exakt 48 eindeutige IDs, den erlaubten
   Namensraum, `body weight`, die Sammlung, gültige Körperbereiche/Niveaus,
   deutsche Schritte und vorhandene Bewegungsdefinitionen.
2. Ein Sperrworttest verhindert Hinweise auf Stuhl, Bett, Bank, Tisch, Hantel,
   Band, Ball, Matte oder andere Ausrüstung.
3. Reine Funktionstests prüfen Posevalidierung, Zwischenwerte, Posterpose und
   Fehlerfallback.
4. Renderer-Tests prüfen SVG-Ausgabe, zugänglichen Namen, Player-/Thumbnailmodus
   und Reduced-Motion-Verhalten.
5. Filtertests prüfen Sammlung allein sowie Kombinationen mit Suche,
   Körperbereich und `body weight`.
6. Die vollständige Frontend-Test-Suite und `npm run build` müssen erfolgreich
   sein.
7. Visuelle Abnahme erfolgt auf Mobil- und Desktopbreite in hellem und dunklem
   Design. Eine begrenzte zweite Runde bestätigt eventuelle Korrekturen.
8. Stichproben für Kniebeuge, Liegestütz, einbeinigen Hüftknick, Wandlauf,
   Superman-Latzug und Käfer müssen Bewegungsrichtung und Gelenkstellung klar
   erkennen lassen.

## Fachliche Leitplanken

Die Auswahl deckt die großen Muskelgruppen mit progressiven Varianten ab und
orientiert sich an etablierten Übersichten für gerätefreies Krafttraining:

- ACE Exercise Library, Filter „No Equipment“:
  https://www.acefitness.org/resources/everyone/exercise-library/equipment/no-equipment/
- NHS, Strength and resistance exercises:
  https://www.nhs.uk/live-well/exercise/strength-and-resistance/
- Mayo Clinic, Strength training with body weight:
  https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/strength-training/art-20046670

Die Darstellung dient der Trainingsorientierung und ersetzt keine medizinische
Beratung. Bei Schmerzen oder unsicherer Ausführung soll die Übung beendet und
fachlicher Rat eingeholt werden.

## Auslieferung

Die Implementierung wird lokal entwickelt und vollständig getestet. Vor einem
GitHub-Push wird Ziel, Branch, Commit und erwartete Wirkung erneut benannt und
eine ausdrückliche Freigabe eingeholt. Vor dem Produktivupdate wird das komplette
openGym-Datenverzeichnis bei gestoppter API konsistent gesichert und geprüft.
Danach werden derselbe unveränderliche `sha-<commit>`-Tag für API und Web über
Portainer ausgerollt und interner Healthcheck, Containerstatus sowie
`https://gym.roddelkopf.net` verifiziert.
