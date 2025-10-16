// src/services/numberToWords.ts

// Función para convertir un número a su representación en letras (simplificado para dólares)
export function numeroALetras(num: number): string {
    const unidades = ["", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
    const decenas = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
    const especiales = ["DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISÉIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE"];
    const centenas = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];

    const getDecenas = (n: number): string => {
        if (n < 10) return unidades[n];
        if (n < 20) return especiales[n - 10];
        const u = n % 10;
        return decenas[Math.floor(n / 10)] + (u > 0 ? " Y " + unidades[u] : "");
    };

    const getCentenas = (n: number): string => {
        if (n === 100) return "CIEN";
        if (n < 100) return getDecenas(n);
        return centenas[Math.floor(n / 100)] + " " + getDecenas(n % 100);
    };

    const entero = Math.floor(num);
    const decimal = Math.round((num - entero) * 100);

    let letras = "";
    if (entero === 0) {
        letras = "CERO";
    } else if (entero < 1000) {
        letras = getCentenas(entero);
    } else if (entero < 2000) {
        letras = "MIL " + getCentenas(entero % 1000);
    } else if (entero < 1000000) {
        letras = getCentenas(Math.floor(entero / 1000)) + " MIL " + getCentenas(entero % 1000);
    }

    return `${letras} CON ${decimal.toString().padStart(2, '0')}/100 DÓLARES`;
}