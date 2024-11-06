const DEBUG = 0;
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let fractalSettings = { xmin: -2, xmax: 1, ymin: -1.5, ymax: 1.5 };
let isSelecting = false;
let startX, startY, endX, endY;
let zoom = 1;
let sampleMethod = 0;
let sampleSeed = 1000;
let iterations = 100;
let samplesPerChar = 100;
let rotation = 0;
let key = "";
let text = "";
let scanline = 0;
let preset = 0;

// Getters für Eingabefelder
function getSampleMethod() {
    sampleMethod = parseInt(document.getElementById("sample-method").value);
    if (DEBUG) console.log("Sample Method: " + sampleMethod);
    updateKey();
    updateFractal();
}

function getPreset() {
    preset = parseInt(document.getElementById("preset").value);
    if (DEBUG) console.log("Preset: " + preset);
    applyPreset(preset);
    updateKey();
    updateFractal();
}

function getSeed() {
    sampleSeed = document.getElementById("seed").value;
    if (DEBUG) console.log("Sample Seed: " + sampleSeed);
    updateKey();
    updateFractal();
}

function getIterations() {
    iterations = document.getElementById("iterations").value;
    if (DEBUG) console.log("Iterations: " + iterations);
    updateKey();
    updateFractal();
}

function getSamplesPerChar() {
    samplesPerChar = document.getElementById("samples-per-char").value;
    if (DEBUG) console.log("Sample per char: " + samplesPerChar);
    updateKey();
    updateFractal();
}

function getRotation() {
    rotation = document.getElementById("matrix-rotation").value;
    if (DEBUG) console.log("Matrix Rotation: " + rotation);
    updateKey();
    updateFractal();
}

function updateKey() {
    key = fractalSettings.xmin + "," +
        fractalSettings.xmax + "," +
        fractalSettings.ymin + "," +
        fractalSettings.ymax + "," +
        iterations + "," +
        samplesPerChar + "," +
        sampleMethod + "," +
        sampleSeed + "," +
        rotation + "," +
        preset;
    document.getElementById("key").value = key;
    if (DEBUG) console.log("Key: " + key);
    if (containsNaN(document.getElementById("key").value)) {
        showPopup("", "Bildausschnitt ist ungültig. Bitte mit der Maus ein Rechteck aufziehen.", 0, 0, "error");
        return; // Füge einen Return hinzu, um die Funktion zu beenden
    }
}

function getKey() {
    key = document.getElementById("key").value
    if (DEBUG) console.log("Key: " + key);
    return key;
}

function getText() {
    text = document.getElementById("inputText").value;
    if (DEBUG) console.log("Input Text: " + text);
    return text;
}

// Zeigt App Hilfe
function getInformation() {
    showPopup("Fraktaler Verschlüsselungscode", "Ein Fraktaler Verschlüsselungscode ist eine sichere Methode zum Sperren des Zugangs zu einem Computer. Der Code basiert auf fraktalen Algorithmen und ist somit kaum von Dritten zu entschlüsseln. Lieutenant Commander Data wendet nach einer Zeitreise der USS Enterprise (NCC-1701-E) aus dem Jahr 2373 ins Jahr 2063 während des Angriffs der Borg auf die Erde einen solchen Code auf den Hauptcomputer an, um die Borg vom Zugriff auszuschließen. (Star Trek: Der erste Kontakt) ", 0, 0, "default");
}

function resetFractal() {
    fractalSettings = { xmin: -2, xmax: 1, ymin: -1.5, ymax: 1.5 };
    updateKey();
    updateFractal();
}

function drawMandelbrot(xmin, xmax, ymin, ymax, zoom, maxIter) {
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.createImageData(width, height);

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let real = xmin + (x / zoom) * (xmax - xmin) / width;
            let imag = ymin + (y / zoom) * (ymax - ymin) / height;
            let zx = 0, zy = 0, iter = 0;

            while (zx * zx + zy * zy <= 4 && iter < maxIter) {
                let tmp = zx * zx - zy * zy + real;
                zy = 2 * zx * zy + imag;
                zx = tmp;
                iter++;
            }

            const color = getColor(iter, maxIter);
            const pixelIndex = (y * width + x) * 4;
            imageData.data[pixelIndex] = color[0];
            imageData.data[pixelIndex + 1] = color[1];
            imageData.data[pixelIndex + 2] = color[2];
            imageData.data[pixelIndex + 3] = 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

function getColor(iter, maxIter) {
    if (iter === maxIter) return [0, 0, 0]; // Schwarz für Punkte im Fraktal

    // Normalisiere den Wert der Iterationen zwischen 0 und 1
    const ratio = iter / maxIter;

    // Berechnung der RGB-Werte basierend auf dem spektralen Verlauf
    let r, g, b;

    if (ratio < 0.5) {
        r = Math.floor(255 * (ratio * 2)); // Rot steigt von 0 auf 255
        g = Math.floor(255 * (1 - ratio * 2)); // Grün sinkt von 255 auf 0
        b = 0; // Blau bleibt 0
    } else {
        r = Math.floor(255 * (1 - (ratio - 0.5) * 2)); // Rot sinkt von 255 auf 0
        g = 0; // Grün bleibt 0
        b = Math.floor(255 * ((ratio - 0.5) * 2)); // Blau steigt von 0 auf 255
    }

    return [r, g, b];
}

function rotateMatrix90(matrix) {
    // Rotiert die Matrix um 90 Grad
    const size = matrix.length;
    let rotated = Array.from(Array(size), () => Array(size).fill(0));

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            rotated[j][size - 1 - i] = matrix[i][j];
        }
    }
    return rotated;
}

function encryptWithRotations(text, xmin, xmax, ymin, ymax) {
    // Original-Matrix erstellen
    let baseMatrix = getFractalMatrix(xmin, xmax, ymin, ymax);

    // 3 weitere rotierte Matrizen erzeugen
    let matrix90 = rotateMatrix90(baseMatrix);
    let matrix180 = rotateMatrix90(matrix90);
    let matrix270 = rotateMatrix90(matrix180);

    // Mehrfach verschlüsseln
    let encryptedText = encrypt(text, baseMatrix); // 1. Durchlauf
    encryptedText = encrypt(encryptedText, matrix90); // 2. Durchlauf
    encryptedText = encrypt(encryptedText, matrix180); // 3. Durchlauf
    encryptedText = encrypt(encryptedText, matrix270); // 4. Durchlauf

    return encryptedText;
}

// Zufallsgenerator mit Seed
function generateNoise(seed, length, maxNumber) {
    const noiseArray = new Array(length);
    let random = new Math.seedrandom(seed);

    for (let i = 0; i < length; i++) {
        noiseArray[i] = Math.floor(random() * maxNumber); // Werte zwischen 0 und maxNumber
    }

    return noiseArray;
}

// Prüfe auf schwarze Flächen
function validateFractal() {
    let stop = false;
    let fractalMatrixIndex = 0;
    let blackAreaCount = 0;
    const fractalMatrix = getFractalMatrix(fractalSettings.xmin, fractalSettings.xmax, fractalSettings.ymin, fractalSettings.ymax);
    while (fractalMatrixIndex < canvas.width * canvas.height) {
        // Wenn Pixelwert = 100 (scharz)
        if (fractalMatrix[fractalMatrixIndex % fractalMatrix.length] == 100) {
            // Überprüfen, ob blackAreaCount zu groß ist (mehr als 25% des Fraktals)
            if (blackAreaCount > (canvas.width * canvas.height) / 2) {
                console.log("Schwarze Pixel: ", blackAreaCount);
                showPopup("Hinweis", "Mit vielen schwarzen Flächen wird die Verschlüsselung potentiell angreifbar. Wenn der Ausschnitt genutzt werden soll, könnte man zusätzlich die Matrix Rotation, 'zufällig sequentiell' oder 'vollständig zufällig' in Betracht ziehen. Es ist jedoch immer besser einen neuen Ausschnitt mit weniger schwarzen Flächen zu wählen.", 0, 0, "hint")
                stop = true;  // Setzt stop auf true, um alle weiteren Berechnungen abzubrechen
                break;
            }
            blackAreaCount++;
            fractalMatrixIndex++;
        }
        else {
            fractalMatrixIndex++;
        }
    }
    // Falls stop gesetzt wurde, kann hier zusätzlicher Code zur Verarbeitung hinzugefügt werden.
    if (stop) {
        console.log("Ein Hinweis wurde gegeben, da zu viele schwarze Flächen vorhanden sind.");
        return 1;
    }
    return 0;
}

function drawPixel(x, y, color) {
    ctx.fillStyle = color;   // Farbe setzen, z.B. 'black' oder '#FF0000'
    ctx.fillRect(x, y, 1, 1); // 1x1 Rechteck, also ein Pixel
}

function drawScanline(pixelCounter) {
    // Berechne x- und y-Position für den Pixel auf der Scanlinie
    const x = pixelCounter % canvas.width;
    const y = scanline;

    // Zeichne den Pixel in weiß für die Scanlinie
    drawPixel(x, y, '#FFFFFF80');

    scanline = Math.floor(pixelCounter / canvas.width); // Zeile, in der sich der Pixel befindet

    // Aktualisiere die Pixelzählung und Sprung zur nächsten Zeile bei Randüberschreitung
    pixelCounter++;
}

function resetScanline() {
    scanline = 0;
}

function encryptText() {
    // Zeige einen Hinweis, wenn das Fraktal mehr als 50% schwaze Flächen hat
    validateFractal();

    const text = document.getElementById("inputText").value; // Verwende value
    let fractalMatrixIndex = 0;
    const fractalMatrix = getFractalMatrix(fractalSettings.xmin, fractalSettings.xmax, fractalSettings.ymin, fractalSettings.ymax);
    if (DEBUG) console.log("Sample Method: " + sampleMethod);
    let encryptedText = "";
    let noise = [];

    switch (sampleMethod) {
        // sequentiell
        case 0:
            encryptedText = text.split('').map((char, index) => {
                const value = char.charCodeAt(0);
                // Addiere laufende Samples aus dem Fraktal
                let fractalValue = 0;
                for (let i = 0; i < samplesPerChar; i++) {
                    fractalValue = (fractalValue + fractalMatrix[fractalMatrixIndex % fractalMatrix.length]) % 256;
                    drawScanline(fractalMatrixIndex);
                    fractalMatrixIndex++;
                }
                return ((value + fractalValue) % 256).toString(16).padStart(2, '0');  // Hexadezimal
            }).join(' ');
            resetScanline();
            break;
        // zufällig sequentiell
        case 1:
            noise = generateNoise(sampleSeed, text.length, (canvas.width * canvas.height) - 1);
            if (DEBUG) console.log("Noise: " + noise);
            encryptedText = text.split('').map((char, index) => {
                // Hole zufälligen Index für Startpunkt in der Matrix
                fractalMatrixIndex = noise[index];
                const value = char.charCodeAt(0);
                // Addiere laufende Samples aus dem Fraktal
                let fractalValue = 0;
                for (let i = 0; i < samplesPerChar; i++) {
                    fractalValue = (fractalValue + fractalMatrix[fractalMatrixIndex % fractalMatrix.length]) % 256;
                    drawScanline(fractalMatrixIndex);
                    fractalMatrixIndex++;
                }
                return ((value + fractalValue) % 256).toString(16).padStart(2, '0');  // Hexadezimal
            }).join(' ');
            resetScanline();
            break;
        // vollständig zufällig
        case 2:
            noise = generateNoise(sampleSeed, samplesPerChar, (canvas.width * canvas.height) - 1);
            if (DEBUG) console.log("Noise: " + noise);
            encryptedText = text.split('').map((char, index) => {
                // Hole ersten Wert aus dem Noise Array
                fractalMatrixIndex = noise[0];
                const value = char.charCodeAt(0);
                // Addiere laufende Samples aus dem Fraktal
                let fractalValue = 0;
                // Berechne jedes Zeichen mehrfach mit der Fraktal Matrix mit den Indizes aus dem Noise Array
                for (let i = 0; i < samplesPerChar; i++) {
                    fractalValue = (fractalValue + fractalMatrix[fractalMatrixIndex % fractalMatrix.length]) % 256;
                    drawScanline(fractalMatrixIndex);
                    fractalMatrixIndex = noise[i];
                }
                return ((value + fractalValue) % 256).toString(16).padStart(2, '0');  // Hexadezimal
            }).join(' ');
            resetScanline();
            break;
        default:
    }
    document.getElementById("inputText").value = encryptedText; // Verwende value hier
    if (DEBUG) console.log("Encrypted Text: " + encryptedText);
}

function hexToInt(hexString) {
    return hexString.split(' ').map(hex => parseInt(hex, 16));
}

function parseKey() {
    // Splitte die Eingabezeichenkette am Komma
    const numberStrings = document.getElementById("key").value.split(',');

    if (containsNaN(numberStrings)) {
        showPopup("", "NaN ist nicht erlaubt.", 0, 0, "error");
        return; // Füge einen Return hinzu, um die Funktion zu beenden
    }

    // Wandle die String-Werte in Zahlen um 
    fractalSettings.xmin = parseFloat(numberStrings[0]);
    fractalSettings.xmax = parseFloat(numberStrings[1]);
    fractalSettings.ymin = parseFloat(numberStrings[2]);
    fractalSettings.ymax = parseFloat(numberStrings[3]);
    iterations = parseInt(numberStrings[4]);
    samplesPerChar = parseInt(numberStrings[5]);
    sampleMethod = parseInt(numberStrings[6]);
    sampleSeed = parseInt(numberStrings[7]);
    rotation = parseInt(numberStrings[8]);
    preset = parseInt(numberStrings[9]);
    updateInputFields();
    updateFractal();
}

function decryptText() {
    const text = document.getElementById("inputText").value;
    const fractalMatrix = getFractalMatrix(fractalSettings.xmin, fractalSettings.xmax, fractalSettings.ymin, fractalSettings.ymax);
    let fractalMatrixIndex = 0;
    let decryptedText = "";
    let noise = [];
    switch (sampleMethod) {
        case 0:
            decryptedText = text.split(' ').map((char, index) => {
                const value = hexToInt(char); // Umwandlung von hexadezimal in int
                // Subtrahiere laufende Samples aus dem Fraktal
                let fractalValue = 0;
                for (let i = 0; i < samplesPerChar; i++) {
                    fractalValue = (fractalValue + fractalMatrix[fractalMatrixIndex % fractalMatrix.length]) % 256;
                    fractalMatrixIndex++;
                }
                return String.fromCharCode((value - fractalValue + 256) % 256); // Sicherstellen, dass das Ergebnis positiv ist
            }).join('');
            break;
        case 1:
            noise = generateNoise(sampleSeed, text.length, (canvas.width * canvas.height) - 1);
            decryptedText = text.split(' ').map((char, index) => {
                // Hole zufälligen Index für Startpunkt in der Matrix
                fractalMatrixIndex = noise[index];
                const value = hexToInt(char); // Umwandlung von hexadezimal in int
                // Subtrahiere laufende Samples aus dem Fraktal
                let fractalValue = 0;
                for (let i = 0; i < samplesPerChar; i++) {
                    fractalValue = (fractalValue + fractalMatrix[fractalMatrixIndex % fractalMatrix.length]) % 256;
                    fractalMatrixIndex++;
                }
                return String.fromCharCode((value - fractalValue + 256) % 256); // Sicherstellen, dass das Ergebnis positiv ist
            }).join('');
            break;
        case 2:
            noise = generateNoise(sampleSeed, samplesPerChar, (canvas.width * canvas.height) - 1);
            if (DEBUG) console.log("Noise: " + noise);
            decryptedText = text.split(' ').map((char, index) => {
                // Hole ersten Wert aus dem Noise Array
                fractalMatrixIndex = noise[0];
                const value = hexToInt(char); // Umwandlung von hexadezimal in int
                let fractalValue = 0;
                // Verrechne jedes Zeichen mehrfach mit der Fraktal Matrix mit den Indizes aus dem Noise Array
                for (let i = 0; i < samplesPerChar; i++) {
                    fractalValue = (fractalValue + fractalMatrix[fractalMatrixIndex % fractalMatrix.length]) % 256;
                    drawScanline(fractalMatrixIndex);
                    fractalMatrixIndex = noise[i];
                }
                return String.fromCharCode((value - fractalValue + 256) % 256); // Sicherstellen, dass das Ergebnis positiv ist
            }).join('');
            break;
        default:
    }

    document.getElementById("inputText").value = decryptedText; // Update den Textbereich mit dem entschlüsselten Text
    updateFractal();
}

function getFractalMatrix(xmin, xmax, ymin, ymax) {
    const width = canvas.width;
    const height = canvas.height;
    let matrix = [];

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let real = xmin + (x / width) * (xmax - xmin);
            let imag = ymin + (y / height) * (ymax - ymin);
            let zx = 0, zy = 0, iter = 0;

            while (zx * zx + zy * zy <= 4 && iter < iterations) {
                let tmp = zx * zx - zy * zy + real;
                zy = 2 * zx * zy + imag;
                zx = tmp;
                iter++;
            }
            matrix.push(iter % 256);
        }
    }
    return matrix;
}

function updateFractal() {
    drawMandelbrot(fractalSettings.xmin, fractalSettings.xmax, fractalSettings.ymin, fractalSettings.ymax, zoom, iterations);
}

function startSelection(event) {
    isSelecting = true;
    startX = event.offsetX;
    startY = event.offsetY;
}

function updateSelection(event) {
    if (!isSelecting) return;
    endX = event.offsetX;
    endY = event.offsetY;
    drawSelection();
}

function drawSelection() {
    updateFractal();  // Fraktal neu zeichnen
    ctx.strokeStyle = "white";
    ctx.strokeRect(startX, startY, endX - startX, endY - startY);
}

function endSelection() {
    isSelecting = false;

    // Berechne ausgewählte Koordinaten im Fraktalbereich
    const width = canvas.width;
    const height = canvas.height;
    const { xmin, xmax, ymin, ymax } = fractalSettings;
    fractalSettings.xmin = xmin + (startX / width) * (xmax - xmin);
    fractalSettings.xmax = xmin + (endX / width) * (xmax - xmin);
    fractalSettings.ymin = ymin + (startY / height) * (ymax - ymin);
    fractalSettings.ymax = ymin + (endY / height) * (ymax - ymin);

    updateKey();

    // Teste auf NaN
    if (containsNaN(key)) {
        //if ((startX == endX) || (startY == endY)) {
        showPopup("", "Bildausschnitt ist ungültig. Bitte mit der Maus ein Rechteck aufziehen. (NaN ist nicht erlaubt)", 0, 0, "error");
        resetFractal();
        updateFractal();
        return;
    }

    updateFractal();
}

canvas.addEventListener("mousedown", startSelection);
canvas.addEventListener("mousemove", updateSelection);
canvas.addEventListener("mouseup", endSelection);

// Funktion zum Schließen des Popups
function closePopup() {
    document.getElementById("popup").classList.add("hidden");
}

// Funktion zum Öffnen des Popups
function showPopup(headline, message, width, height, style) {
    let collection = document.getElementsByClassName("popup-content");
    let classList = [];

    for (let i = 0; i < collection.length; i++) {
        // Hol die Liste aller Klassen des Elements
        classList = collection[i].classList;
        // Prüfe, ob es mehr als einen Klassennamen gibt
        if (classList.length > 1) {
            // Entferne den letzten Klassennamen
            let lastClass = classList[classList.length - 1];
            classList.remove(lastClass);
        }
    }

    switch (style) {
        // rot
        case "error":
            document.getElementById("popup-message").textContent = message;
            document.getElementById("popup-headline").textContent = "Fehler";
            // Füge den neuen Klassennamen hinzu
            for (let i = 0; i < collection.length; i++) {
                classList.add("error");
            }
            break;
        // gelb
        case "hint":
            document.getElementById("popup-message").textContent = message;
            document.getElementById("popup-headline").textContent = "Hinweis";
            for (let i = 0; i < collection.length; i++) {
                classList.add("hint");
            }
            break;
        // grün
        case "sucsess":
            document.getElementById("popup-message").textContent = message;
            document.getElementById("popup-headline").textContent = headline;
            for (let i = 0; i < collection.length; i++) {
                classList.add("sucsess");
            }
            break;
        // grau
        default:
            document.getElementById("popup-message").textContent = message;
            document.getElementById("popup-headline").textContent = headline;
            for (let i = 0; i < collection.length; i++) {
                classList.add("default");
            }

    }
    document.getElementById("popup").classList.remove("hidden");
}

function containsNaN(str) {
    return str.includes("NaN");
}

function copyToClipboard(field) {
    let textToCopy; // Deklariere die Variable

    // Bestimme, welches Feld kopiert werden soll
    if (field === "text") {
        textToCopy = document.getElementById('inputText');
    } else if (field === "key") {
        textToCopy = document.getElementById('key');
    }

    if (textToCopy) {
        // Wähle den Text in der Textarea oder im Input-Feld aus
        textToCopy.select();
        textToCopy.setSelectionRange(0, 99999); // Für mobile Geräte

        // Kopiere den ausgewählten Text in die Zwischenablage
        navigator.clipboard.writeText(textToCopy.value)
            .then(() => {
                //alert('Text kopiert: ' + textToCopy.value);
                showPopup("In Zwischenablage kopiert", textToCopy.value.substring(0, 255) + " ...", 0, 0, "sucsess");
            })
            .catch(err => {
                console.error('Fehler beim Kopieren: ', err);
            });
    } else {
        console.error('Kein gültiges Feld zum Kopieren gefunden.');
    }

}

function applyPreset(preset) {
    switch (preset) {
        case 0:
            // Sternenflotte Default (schwach)
            //-1.445,0.625,-1.065,0.9975,100,10,0,1000,0,0
            fractalSettings = { xmin: -1.445, xmax: 0.625, ymin: -1.065, ymax: 0.9975 };
            iterations = 100;
            samplesPerChar = 10;
            sampleMethod = 0;
            sampleSeed = 1000;
            rotation = 0;
            updateKey();
            break;
        case 1:
            // Worf-3-7-Gamma-Echo (gut)
            // 0.29725,0.2995,-0.019275000000000014,-0.016575000000000013,100,20,0,1000,0,2
            fractalSettings = { xmin: 0.29725, xmax: 0.2995, ymin: -0.019275000000000014, ymax: -0.016575000000000013 };
            iterations = 100;
            samplesPerChar = 20;
            sampleMethod = 0;
            sampleSeed = 1000;
            rotation = 0;
            updateKey();
            break;
        case 2:
            // Picard-4-7-Alpha-Tango (stark)
            // -0.983451125,-0.9785303750000001,-0.28212375000000006,-0.276654,100,100,1,9999,0,1
            fractalSettings = { xmin: -0.983451125, xmax: -0.9785303750000001, ymin: -0.28212375000000006, ymax: -0.276654 };
            iterations = 100;
            samplesPerChar = 50;
            sampleMethod = 1;
            sampleSeed = 9999;
            rotation = 0;
            updateKey();
            break;
        case 3:
            // Data's Borg Crypt 20630405 (unknackbar)
            //-0.26326250000000007,-0.25278125000000007,-0.66031875,-0.6500812499999999,200,100,2,871234451,0,3
            fractalSettings = { xmin: -0.26326250000000007, xmax: -0.25278125000000007, ymin: -0.66031875, ymax: -0.6500812499999999 };
            iterations = 200;
            samplesPerChar = 100;
            sampleMethod = 2;
            sampleSeed = 871234451;
            rotation = 0;
            updateKey();
            break;
        case 4:
            // Weltraum-Wirbel
            // 0.2943522125799924,0.2973456054772599,-0.48361457390566404,-0.48080357875136714,400,100,2,871234451,0,4
            document.getElementById("key").value = "0.2943522125799924,0.2973456054772599,-0.48361457390566404,-0.48080357875136714,400,100,2,871234451,0,4";
            parseKey();
            break;
        case 5:
            // Das Auge der Cleopatra
            // -0.74880771875,-0.7438745468749999,-0.11731509374999996,-0.11283731249999997,400,100,2,871234451,0,5
            document.getElementById("key").value = "-0.74880771875,-0.7438745468749999,-0.11731509374999996,-0.11283731249999997,400,100,2,871234451,0,5";
            parseKey();
            break;
        case 6:
            // User
            // -2,1,-1.5,1.5,100,100,0,1234,0,6
            document.getElementById("key").value = "-2,1,-1.5,1.5,100,100,0,1234,0,6";
            parseKey();
            break;

        default:
            return;
    }
    updateInputFields();
    updateFractal();
}

function updateInputFields() {
    document.getElementById("iterations").value = iterations;
    document.getElementById("samples-per-char").value = samplesPerChar;
    document.getElementById("sample-method").value = sampleMethod;
    document.getElementById("seed").value = sampleSeed;
    document.getElementById("matrix-rotation").value = rotation;
    document.getElementById("preset").value = preset;
}

applyPreset(0);