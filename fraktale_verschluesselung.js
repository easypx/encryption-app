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
let key = ""; // Keybuffer
let text = ""; // Textbuffer
let scanline = 0;
let preset = 0;
let appVersion = document.getElementById("app-version").getAttribute("version");
console.log("App Version: " + appVersion);
let inputFormat = 0;
let outputFormat = 1;
const appName = "ST8-Fractal-Encryption";

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
        preset + "," +
        appVersion;

    if (DEBUG) console.log("Key as Parameters: " + key);
    if (containsNaN(key)) {
        showPopup("", "NaN im Key gefunden. Key ist ungültig.", 0, 0, "error");
        return; // Füge einen Return hinzu, um die Funktion zu beenden
    }
    // Wandle in Hex um
    const hexKey = stringToHex(key);
    document.getElementById("key").value = hexKey;
    console.log("Key as Hexadezimal:", hexKey);
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

function getInputFormat() {
    inputFormat = parseInt(document.getElementById("input-format").value);
    updateKey(); // TODO
}

function getOutputFormat() {
    outputFormat = parseInt(document.getElementById("output-format").value);
    updateKey(); // TODO
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
                showPopup("Hinweis", "Mit großen, schwarzen Flächen wird die Verschlüsselung potentiell angreifbar. Wenn sich die Flächen eher am Rand befinden, könnte man zusätzlich die Matrix Rotation in Betracht ziehen. Es ist jedoch immer besser einen neuen, variationsreichen Ausschnitt zu wählen.", 0, 0, "hint")
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

// TODO: Any to any
function formatAsciiToAny(outputFormat, value, fractalValue) {
    let encryptedChar = "";
    if (outputFormat == 0) {
        encryptedChar = String.fromCharCode((value + fractalValue) % 256); // als Text
    }
    else if (outputFormat == 1) {
        encryptedChar = ((value + fractalValue) % 256).toString(16).padStart(2, '0');  // als Hexadezimal
    }
    else if (outputFormat == 2) {
        let temp = String.fromCharCode((value + fractalValue) % 256);
        encryptedChar = charToNucleobases(temp); // als Quads
    }
    return encryptedChar;
}

function formatAnyToAscii(inputFormat, inputChar) {
    //let encryptedChar = inputChar.split('');
    //let hexString = inputChar;
    let decryptedChar = "";
    // Hexadezimal
    if (inputFormat == 0) {
        // Tue nichts
    }
    else if (inputFormat == 1) {
        decryptedChar = String.fromCharCode(hexToInt(inputChar) % 256);  // als Hexadezimal
    }
    else if (inputFormat == 2) {
        let temp = String.fromCharCode((value + fractalValue) % 256);
        decryptedChar = charToNucleobases(temp); // als Quads
    }
    return decryptedChar;
}

function splitHexToBytes(hexString) {
    let byteArray = [];

    // Iteriere in 2er-Schritten durch den String und füge jedes Byte hinzu
    for (let i = 0; i < hexString.length; i += 2) {
        byteArray.push(hexString.substring(i, i + 2));
    }

    return byteArray;
}

function encryptText() {
    const startTime = performance.now();  // Startzeit erfassen
    // Zeige einen Hinweis, wenn das Fraktal mehr als 50% schwaze Flächen hat
    validateFractal();

    text = document.getElementById("inputText").value; // Verwende value
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
                return ((value + fractalValue) % 256).toString(16).padStart(2, '0');  // als Hexadezimal
            }).join('');
            resetScanline();
            break;
        // zufällig sequentiell
        case 1:
            noise = generateNoise(sampleSeed, text.length, (canvas.width * canvas.height) - 1);
            if (DEBUG) console.log("Noise: " + noise);
            encryptedText = text.split('').map((char, index) => {
                const value = char.charCodeAt(0);
                // Hole zufälligen Index für Startpunkt in der Matrix
                fractalMatrixIndex = noise[index];
                // Addiere laufende Samples aus dem Fraktal
                let fractalValue = 0;
                for (let i = 0; i < samplesPerChar; i++) {
                    fractalValue = (fractalValue + fractalMatrix[fractalMatrixIndex % fractalMatrix.length]) % 256;
                    drawScanline(fractalMatrixIndex);
                    fractalMatrixIndex++;
                }
                return ((value + fractalValue) % 256).toString(16).padStart(2, '0');  // Hexadezimal
            }).join('');
            resetScanline();
            break;
        // vollständig zufällig
        case 2:
            noise = generateNoise(sampleSeed, samplesPerChar, (canvas.width * canvas.height) - 1);
            if (DEBUG) console.log("Noise: " + noise);
            encryptedText = text.split('').map((char, index) => {
                const value = char.charCodeAt(0);
                // Hole ersten Wert aus dem Noise Array
                fractalMatrixIndex = noise[0];
                // Addiere laufende Samples aus dem Fraktal
                let fractalValue = 0;
                // Berechne jedes Zeichen mehrfach mit der Fraktal Matrix mit den Indizes aus dem Noise Array
                for (let i = 0; i < samplesPerChar; i++) {
                    fractalValue = (fractalValue + fractalMatrix[fractalMatrixIndex % fractalMatrix.length]) % 256;
                    drawScanline(fractalMatrixIndex);
                    fractalMatrixIndex = noise[i];
                }
                return ((value + fractalValue) % 256).toString(16).padStart(2, '0');  // Hexadezimal
            }).join('');
            resetScanline();
            break;
        default:
    }
    encryptedText = stringToHex(`App-Name: ${appName} Version: ${appVersion} Format: ${outputFormat} Data: `) + encryptedText;// Füge Header hinzu
    text = encryptedText; // Sichern in Textbuffer

    const endTime = performance.now();    // Endzeit erfassen
    const encryptionTime = endTime - startTime; // Zeitdauer berechnen
    document.getElementById("time").innerHTML = encryptionTime + ' ' + 'ms';

    console.log(`Verschlüsselungszeit: ${encryptionTime.toFixed(2)} ms`);
    document.getElementById("inputText").value = text; // Verwende value hier
    if (DEBUG) console.log("Encrypted Text: " + encryptedText);
}

function decryptText() {
    const startTime = performance.now();  // Startzeit erfassen
    
    // Lese Header und Datenblock
    let data = parseHexHeader(document.getElementById("inputText").value);
    if (DEBUG) console.log("Data: ", data);

    // Hole Datablock
    text = data.data;

    const fractalMatrix = getFractalMatrix(fractalSettings.xmin, fractalSettings.xmax, fractalSettings.ymin, fractalSettings.ymax);
    let fractalMatrixIndex = 0;
    let decryptedText = "";
    let noise = [];
    let temp = "";
    switch (sampleMethod) {
        case 0:
            decryptedText = splitHexToBytes(text).map((char, index) => {
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
            decryptedText = splitHexToBytes(text).map((char, index) => {
                const value = hexToInt(char); // Umwandlung von hexadezimal in int
                // Hole zufälligen Index für Startpunkt in der Matrix
                fractalMatrixIndex = noise[index];
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
            decryptedText = splitHexToBytes(text).map((char, index) => {
                const value = hexToInt(char); // Umwandlung von hexadezimal in int
                // Hole ersten Wert aus dem Noise Array
                fractalMatrixIndex = noise[0];
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
    const endTime = performance.now();    // Endzeit erfassen
    const decryptionTime = endTime - startTime; // Zeitdauer berechnen
    document.getElementById("time").innerHTML = decryptionTime + ' ' + 'ms';

    console.log(`Entschlüsselungszeit: ${decryptionTime.toFixed(2)} ms`);
    text = decryptedText; // Sichern in Textbuffer
    document.getElementById("inputText").value = text; // Update den Textbereich mit dem entschlüsselten Text
    updateFractal();
}

function parseHexHeader(hexString) {
    // Zuerst Hexadezimal in String umwandeln
    const decodedString = hexToString(hexString);

    // Parameter extrahieren
    const appNameMatch = decodedString.match(/App-Name:\s*(\S+)/);
    const versionMatch = decodedString.match(/Version:\s*(\S+)/);
    const formatMatch = decodedString.match(/Format:\s*(\S+)/);
    const dataMatch = decodedString.match(/Data:\s*([\s\S]+)/);

    // Ergebnisse in einem Objekt speichern
    const result = {
        appname: appNameMatch ? appNameMatch[1] : null,
        version: versionMatch ? versionMatch[1] : null,
        format: formatMatch ? formatMatch[1] : null,
        data: dataMatch ? stringToHex(dataMatch[1]) : null
    };
    return result;
}

function hexToInt(hexString) {
    return hexString.split(' ').map(hex => parseInt(hex, 16));
}

function parseKey() {
    // Wandle Hex in String um
    const hexKey = document.getElementById("key").value;
    key = hexToString(hexKey);

    // Splitte die Eingabezeichenkette am Komma
    let numberStrings = "";
    numberStrings = key.split(',');

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

    if (appVersion != parseInt(numberStrings[10])) {
        showPopup("", "Der Key ist nicht kompatiblen mit dieser App Version. Die Verschlüsselung wird wahrscheinlich nicht korrekt funktionieren.", 0, 0, "error");
    }
    updateInputFields();
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
            document.getElementById("key").value = stringToHex(`-1.445,0.625,-1.065,0.9975,100,10,0,1000,0,0,${appVersion}`);
            parseKey();
            break;
        case 1:
            // Worf-3-7-Gamma-Echo (gut)
            document.getElementById("key").value = stringToHex(`0.29725,0.2995,-0.019275000000000014,-0.016575000000000013,100,20,0,1000,0,1,${appVersion}`);
            parseKey();
            break;
        case 2:
            // Picard-4-7-Alpha-Tango (stark)
            document.getElementById("key").value = stringToHex(`-0.983451125,-0.9785303750000001,-0.28212375000000006,-0.276654,100,100,1,9999,0,2,${appVersion}`);
            parseKey();
            break;
        case 3:
            // Data's Borg Crypt 20630405 (unknackbar)
            document.getElementById("key").value = stringToHex(`-0.26326250000000007,-0.25278125000000007,-0.66031875,-0.6500812499999999,200,100,2,871234451,0,3,${appVersion}`);
            parseKey();
            break;
        case 4:
            // Weltraum-Wirbel
            document.getElementById("key").value = stringToHex(`0.2943522125799924,0.2973456054772599,-0.48361457390566404,-0.48080357875136714,400,100,2,871234451,0,4,${appVersion}`);
            parseKey();
            break;
        case 5:
            // Das Auge der Cleopatra
            document.getElementById("key").value = stringToHex(`-0.74880771875,-0.7438745468749999,-0.11731509374999996,-0.11283731249999997,400,100,2,871234451,0,5,${appVersion}`);
            parseKey();
            break;
        case 6:
            // Sternenspektrum
            document.getElementById("key").value = stringToHex(`-0.37118750000000006,-0.16812500000000008,-0.6538125,-0.6539250000000001,100,100,0,1000,0,6,${appVersion}`);
            parseKey();
            break;

        case 7:
            // User
            document.getElementById("key").value = stringToHex(`-2,1,-1.5,1.5,100,100,0,1234,0,7,${appVersion}`);
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

window.onload = function () {
    console.log('Dokument geladen');
    applyPreset(2);
}