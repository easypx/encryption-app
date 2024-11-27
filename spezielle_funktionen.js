function charToNucleobases(char) {
    // ASCII-Wert des Zeichens ermitteln
    let asciiValue = char.charCodeAt(0);

    // Nukleinbasen-Map: 2^0 -> A, 2^1 -> G, 2^2 -> C, 2^3 -> T
    //const baseMap = ['└', '┬', '┼', '┌'];
    const baseMap = ['░', '▒', '▓', '█'];
    //const baseMap = ['▄', '■', '▀', '█'];
    //const baseMap = ['A', 'C', 'G', 'T'];
    let nucleobaseSequence = '';

    // Schleife für die 4 Nukleinbasen (4 x 2 Bit)
    for (let i = 0; i < 4; i++) {
        // Die letzten zwei Bits des ASCII-Werts extrahieren
        let baseIndex = asciiValue & 0b11; // & 3 ist äquivalent zu % 4
        // Füge die entsprechende Nukleinbase zur Sequenz hinzu
        nucleobaseSequence = baseMap[baseIndex] + nucleobaseSequence;
        // Verschiebe den ASCII-Wert um 2 Bits nach rechts, entspricht Division durch 2² = 4
        asciiValue >>= 2;
    }
    // Ausgabe entspricht dem Format "AGCT"
    return nucleobaseSequence;
}

function stringToNucleobases(string) {
    let stringBuffer = string.split('');
    let acidBaseString = '';
    for (let i = 0; i < stringBuffer.length; i++) {
        acidBaseString = charToNucleobases(stringBuffer[i]).concat(acidBaseString);
    }
    return acidBaseString;
}

function nucleobasesToChar(bases) {
    // Nukleinbasen zu Indexen mapen: A = 0, G = 1, C = 2, T = 3
    //const baseMap = { 'A': 0, 'G': 1, 'C': 2, 'T': 3 };
    const baseMap = { '░': 0, '▒': 1, '▓': 2, '█': 3 };
    let asciiValue = 0;

    // Schleife über den Basis-String (jede Basis entspricht 2 Bits)
    for (let i = 0; i < 4; i++) {
        // Extrahiere den Index der aktuellen Nukleinbase
        let baseIndex = baseMap[bases[i]];
        // Setze die entsprechenden 2 Bits an die richtige Stelle
        asciiValue = (asciiValue << 2) | baseIndex;
    }

    // Rückgabe des ASCII-Zeichens
    return String.fromCharCode(asciiValue);
}

function nucleobasesToString(bases) {
    let asciiString = "";
    let stringBuffer = bases.split('');
    let nucleobases = "";
    for (let i = 0; i < stringBuffer.length; i++) {
        nucleobases = nucleobases + stringBuffer[i];
        if (nucleobases.length % 4 == 0) {
            asciiString = nucleobasesToChar(nucleobases) + asciiString;
            nucleobases = "";
        }
    }
    return asciiString;
}

function toAsciiBase256(number) {
    if (number === 0) return String.fromCharCode(0); // Sonderfall für 0

    let asciiRepresentation = '';

    while (number > 0) {
        // Nimm den Rest der Division durch 256
        let remainder = number % 256;
        // Wandelt den Rest in das entsprechende ASCII-Zeichen um
        asciiRepresentation = String.fromCharCode(remainder) + asciiRepresentation;
        // Teile die Zahl durch 256, um zur nächsten Ziffer zu gelangen
        number = Math.floor(number / 256);
    }

    return asciiRepresentation;
}

// Die Umkehrfunktion zu toAsciiBase256
function asciiBase256ToNumber(asciiStr) {
    let number = 0;

    // Jeden ASCII-Wert dekodieren und mit Basis 256 gewichten
    for (let i = 0; i < asciiStr.length; i++) {
        number = number * 256 + asciiStr.charCodeAt(i);
    }

    return number;
}

function toAsciiBaseN(number, N) {
    if (number === 0) return String.fromCharCode(0); // Sonderfall für 0

    let asciiRepresentation = '';
    let remainderArray = [];
    let asciiNumber = 0;
    let asciiNumberArray = [];

    while (number > 0) {
        // Nimm den Rest der Division durch 256
        let remainder = number % N;
        // Wandelt den Rest in das entsprechende ASCII-Zeichen um
        asciiRepresentation = String.fromCharCode(remainder) + asciiRepresentation;
        asciiNumber = remainder + asciiNumber;
        // Teile die Zahl durch 256, um zur nächsten Ziffer zu gelangen
        number = Math.floor(number / N);
        //remainderArray.push(remainder);
        asciiNumberArray.push(asciiNumber);
    }
    return asciiRepresentation;
}

// Die Umkehrfunktion zu toAsciiBase256
function asciiBaseNToNumber(asciiStr, N) {
    let number = 0;

    // Jeden ASCII-Wert dekodieren und mit Basis 256 gewichten
    for (let i = 0; i < asciiStr.length; i++) {
        number = number * N + asciiStr.charCodeAt(i);
    }

    return number;
}

function runLengthEncode(input) {
    let compressed = "";
    let count = 1;

    for (let i = 1; i <= input.length; i++) {
        // Überprüfen, ob das aktuelle Zeichen gleich dem vorherigen ist
        if (input[i] === input[i - 1]) {
            count++;
        } else {
            // Speichere das Zeichen und die Anzahl
            if (count > 1) {
                compressed += input[i - 1] + count;
            }
            // Wenn nur ein Zeichen, ohne Anzahl
            else if (count == 1) {
                compressed += input[i - 1];
            }
            count = 1;
        }
    }

    return compressed;
}

function charToBits(char) {
    switch (char) {
        case 'A': return '00';
        case 'G': return '01';
        case 'C': return '10';
        case 'T': return '11';
        default: throw new Error('Unknown character');
    }
}

function rleBitpackedEncode(input) {
    let result = '';
    let count = 1;

    for (let i = 1; i <= input.length; i++) {
        if (input[i] === input[i - 1] && count < 15) {
            count++;
        } else {
            // Zeichen in 2-Bit-Codierung + Wiederholungslänge in 4 Bits
            result += charToBits(input[i - 1]) + count.toString(2).padStart(4, '0');
            count = 1;
        }
    }

    return result;
}

// Schritt 1: Führe Run-Length-Encoding aus
function runLengthEncode(input) {
    let rleResult = '';
    let count = 1;

    for (let i = 1; i <= input.length; i++) {
        if (input[i] === input[i - 1]) {
            count++;
        } else {
            rleResult += input[i - 1] + count;
            count = 1;
        }
    }

    return rleResult;
}

// Schritt 2: Erstelle Huffman-Baum
function buildHuffmanTree(freqMap) {
    const heap = Object.entries(freqMap).map(([char, freq]) => ({ char, freq, left: null, right: null }));
    while (heap.length > 1) {
        heap.sort((a, b) => a.freq - b.freq);
        const left = heap.shift();
        const right = heap.shift();
        heap.push({ char: null, freq: left.freq + right.freq, left, right });
    }
    return heap[0];
}

// Schritt 3: Huffman-Codierungstabelle erstellen
function createHuffmanCodeTable(node, prefix = '', codeTable = {}) {
    if (!node.left && !node.right) {
        codeTable[node.char] = prefix;
    } else {
        if (node.left) createHuffmanCodeTable(node.left, prefix + '0', codeTable);
        if (node.right) createHuffmanCodeTable(node.right, prefix + '1', codeTable);
    }
    return codeTable;
}

// Schritt 4: Komprimiere mit Huffman-Codes
function huffmanEncode(rleEncodedString) {
    // Frequenzen zählen
    const freqMap = {};
    for (const char of rleEncodedString) freqMap[char] = (freqMap[char] || 0) + 1;

    // Baum und Codierungstabelle erstellen
    const huffmanTree = buildHuffmanTree(freqMap);
    const huffmanTable = createHuffmanCodeTable(huffmanTree);

    // Kodieren
    return rleEncodedString.split('').map(char => huffmanTable[char]).join('');
}

// Funktion: String zu Hexadezimal
function stringToHex(str) {
    return Array.from(str)
        .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('');
}

// Funktion: Hexadezimal zu String
function hexToString(hex) {
    return hex.match(/.{1,2}/g)
        .map(byte => String.fromCharCode(parseInt(byte, 16)))
        .join('');
}


