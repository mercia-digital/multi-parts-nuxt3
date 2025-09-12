// A map of common HTML entities for server-side decoding.
const basicEntityMap = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&#x2F;': '/',
};

// A universal HTML decoding function.
const decodeHtmlEntities = (encodedString) => {
  if (typeof window !== 'undefined') {
    // Client-side: Use the browser's built-in DOM parser for accuracy.
    const parser = new DOMParser();
    const dom = parser.parseFromString(`<!doctype html><body>${encodedString}`, 'text/html');
    return dom.body.textContent;
  } else {
    // Server-side: Use a basic regex for performance. 
    // This handles the most common cases without a heavy dependency.
    return encodedString.replace(/(&[a-zA-Z0-9#]+;)/g, (entity) => {
      return basicEntityMap[entity] || entity;
    });
  }
};

export const fixEncodingErrors = (text) => {
    if (!text) {
        return text;
    }

    // First, decode HTML entities using our universal function.
    let cleaned = decodeHtmlEntities(text);

    // Clean up any hidden characters that might be breaking up sequences.
    cleaned = cleaned.replace(/\s+/g, ' ');  // Replace any whitespace sequences with a single space.

    // Map of solved mojibake issues - ordered by most common patterns first.
    const mojibakeMap = {
        // Common trademark/copyright patterns
        'â„¢': '™',     // Corrupted Trademark symbol (most common)
        'â¢': '™',      // Alternative corrupted Trademark symbol
        'â\u0084¢': '™', // Corrupted Trademark with hidden char (0x84)
        'â®': '®',      // Corrupted Registered trademark 
        'Â©': '©',      // Corrupted Copyright
        'Â®': '®',      // Alternative corrupted Registered trademark

        // Quote patterns
        'â€™': '\'',    // Corrupted Right Single Quote
        'â€˜': '\'',    // Corrupted Left Single Quote  
        'â€œ': '"',     // Corrupted Left Double Quote
        'â€': '"',      // Corrupted Right Double Quote

        // Dash patterns
        'â€"': '–',     // Corrupted En Dash
        'â€"': '—',     // Corrupted Em Dash

        // Subscript/superscript
        'â‚‚': '₂',     // Corrupted Subscript Two
        'Â²': '²',      // Corrupted Superscript Two
        'Â³': '³',      // Corrupted Superscript Three

        // Accented characters
        'Ã©': 'é',      // Corrupted 'e' with acute
        'Ã±': 'ñ',      // Corrupted 'n' with tilde  
        'Ã¡': 'á',      // Corrupted 'a' with acute
        'Ã­': 'í',      // Corrupted 'i' with acute
        'Ã³': 'ó',      // Corrupted 'o' with acute
        'Ãº': 'ú',      // Corrupted 'u' with acute

        // Degree and math symbols
        'Â°': '°',      // Corrupted Degree symbol
        'Â±': '±',      // Corrupted Plus-minus
        'Ã—': '×',      // Corrupted Multiplication 
        'Ã·': '÷',      // Corrupted Division

        // Other common symbols
        'â€¦': '…',     // Corrupted Ellipsis
        'â€¢': '•',     // Corrupted Bullet point
        'Â¢': '¢',      // Corrupted Cent symbol
        'Â£': '£',      // Corrupted Pound symbol
        'â‚¬': '€',     // Corrupted Euro symbol
    };

    // Apply mojibake replacements.
    for (const [badString, goodChar] of Object.entries(mojibakeMap)) {
        const escapedBadString = badString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        cleaned = cleaned.replace(new RegExp(escapedBadString, 'g'), goodChar);
    }

    return cleaned;
}