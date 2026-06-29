"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.random = random;
exports.sanitizeString = sanitizeString;
function random(len) {
    let options = "ewklrjhewkrjqklejwerqe231312312";
    let length = options.length;
    let ans = "";
    for (let i = 0; i < len; i++) {
        ans += options[Math.floor(Math.random() * length)];
    }
    return ans;
}
/**
 * Sanitizes a string by removing invalid control characters (except common whitespace),
 * null bytes, and potentially database-breaking invalid sequences.
 * Truncates to max length if provided.
 */
function sanitizeString(str, maxLength) {
    if (!str)
        return '';
    // Remove null bytes and non-printable control characters except newline, carriage return, and tab
    let sanitized = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
    if (maxLength && sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }
    return sanitized;
}
