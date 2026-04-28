/**
 * Validateur intelligent avec gestion des contractions et fuzzy matching
 */
export class Validator {
    constructor() {
        this.contractions = {
            "i am": "i'm", "you are": "you're", "he is": "he's", "she is": "she's", "it is": "it's",
            "we are": "we're", "they are": "they're", "i have": "i've", "you have": "you've",
            "we have": "we've", "they have": "they've", "he has": "he's", "she has": "she's",
            "i will": "i'll", "you will": "you'll", "he will": "he'll", "she will": "she'll",
            "we will": "we'll", "they will": "they'll", "i would": "i'd", "he would": "he'd",
            "do not": "don't", "does not": "doesn't", "did not": "didn't", "have not": "haven't",
            "has not": "hasn't", "is not": "isn't", "are not": "aren't", "cannot": "can't",
            "will not": "won't"
        };
    }

    normalize(str) {
        return (str || "").toLowerCase().replace(/[.,!?;:]/g, "").replace(/\s+/g, " ").trim();
    }

    getVariants(text) {
        let variants = new Set([text]);
        const normalizedText = this.normalize(text);

        for (const [full, short] of Object.entries(this.contractions)) {
            if (normalizedText.includes(full)) variants.add(normalizedText.replace(full, short));
            if (normalizedText.includes(short)) variants.add(normalizedText.replace(short, full));
        }
        return Array.from(variants);
    }

    levenshtein(a, b) {
        const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
        for (let j = 1; j <= b.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
            }
        }
        return matrix[a.length][b.length];
    }

    check(userInput, expected) {
        const u = this.normalize(userInput);
        const e = this.normalize(expected);
        if (u === e) return true;

        const variants = this.getVariants(e).map(v => this.normalize(v));
        if (variants.includes(u)) return true;

        if (e.length > 5 && this.levenshtein(u, e) <= 1) return true;
        return false;
    }
}
