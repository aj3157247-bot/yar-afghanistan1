/*
 * YAR Afghanistan
 * Offline Translation Engine
 *
 * دری ↔ پښتو ↔ English
 */

const YAR_TRANSLATIONS = {

    dari: {
        "سلام": {
            pashto: "سلام",
            english: "Hello"
        },

        "خوب هستم": {
            pashto: "زه ښه یم",
            english: "I am fine"
        },

        "خوبی؟": {
            pashto: "ته څنګه یې؟",
            english: "How are you?"
        },

        "تشکر": {
            pashto: "مننه",
            english: "Thank you"
        },

        "ممنون": {
            pashto: "مننه",
            english: "Thank you"
        },

        "خداحافظ": {
            pashto: "په مخه دې ښه",
            english: "Goodbye"
        },

        "صبح بخیر": {
            pashto: "سهار مو پخیر",
            english: "Good morning"
        },

        "شب بخیر": {
            pashto: "شپه مو پخیر",
            english: "Good night"
        },

        "بله": {
            pashto: "هو",
            english: "Yes"
        },

        "نه": {
            pashto: "نه",
            english: "No"
        },

        "من افغانستان را دوست دارم": {
            pashto: "زه افغانستان سره مینه لرم",
            english: "I love Afghanistan"
        }
    },

    pashto: {

        "سلام": {
            dari: "سلام",
            english: "Hello"
        },

        "زه ښه یم": {
            dari: "من خوب هستم",
            english: "I am fine"
        },

        "ته څنګه یې؟": {
            dari: "خوبی؟",
            english: "How are you?"
        },

        "مننه": {
            dari: "تشکر",
            english: "Thank you"
        },

        "په مخه دې ښه": {
            dari: "خداحافظ",
            english: "Goodbye"
        },

        "سهار مو پخیر": {
            dari: "صبح بخیر",
            english: "Good morning"
        },

        "شپه مو پخیر": {
            dari: "شب بخیر",
            english: "Good night"
        },

        "هو": {
            dari: "بله",
            english: "Yes"
        },

        "نه": {
            dari: "نه",
            english: "No"
        },

        "زه افغانستان سره مینه لرم": {
            dari: "من افغانستان را دوست دارم",
            english: "I love Afghanistan"
        }
    },

    english: {

        "hello": {
            dari: "سلام",
            pashto: "سلام"
        },

        "hi": {
            dari: "سلام",
            pashto: "سلام"
        },

        "how are you?": {
            dari: "خوبی؟",
            pashto: "ته څنګه یې؟"
        },

        "i am fine": {
            dari: "خوب هستم",
            pashto: "زه ښه یم"
        },

        "thank you": {
            dari: "تشکر",
            pashto: "مننه"
        },

        "goodbye": {
            dari: "خداحافظ",
            pashto: "په مخه دې ښه"
        },

        "good morning": {
            dari: "صبح بخیر",
            pashto: "سهار مو پخیر"
        },

        "good night": {
            dari: "شب بخیر",
            pashto: "شپه مو پخیر"
        },

        "yes": {
            dari: "بله",
            pashto: "هو"
        },

        "no": {
            dari: "نه",
            pashto: "نه"
        },

        "i love afghanistan": {
            dari: "من افغانستان را دوست دارم",
            pashto: "زه افغانستان سره مینه لرم"
        }
    }
};


/*
 * Normalize text
 */

function yarNormalize(text) {

    return String(text)
        .trim()
        .toLowerCase()
        .replace(/ي/g, "ی")
        .replace(/ى/g, "ی")
        .replace(/ك/g, "ک")
        .replace(/\s+/g, " ");
}


/*
 * Translate
 */

function yarTranslate(text, from, to) {

    if (!text) {
        return "";
    }

    if (from === to) {
        return text;
    }

    const normalized = yarNormalize(text);

    const source = YAR_TRANSLATIONS[from];

    if (!source) {
        return null;
    }

    /*
     * Exact sentence
     */

    if (
        source[normalized] &&
        source[normalized][to]
    ) {
        return source[normalized][to];
    }


    /*
     * Word-by-word fallback
     */

    const words = normalized.split(" ");

    let translated = [];

    let found = false;


    for (const word of words) {

        let translatedWord = null;

        for (const key in source) {

            const keyNormalized =
                yarNormalize(key);

            if (
                keyNormalized === word &&
                source[key][to]
            ) {

                translatedWord =
                    source[key][to];

                found = true;

                break;
            }
        }

        translated.push(
            translatedWord || word
        );
    }


    if (found) {
        return translated.join(" ");
    }


    return null;
}


/*
 * Public helper
 */

window.YarTranslator = {

    translate: yarTranslate,

    languages: [
        "dari",
        "pashto",
        "english"
    ]

};
