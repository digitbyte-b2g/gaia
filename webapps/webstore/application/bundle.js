(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var logger = require('./logger');
var messages = require('./messages');


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function install(navigator) {
    navigator = navigator || window.navigator;

    logger.log('Activity support?', !!navigator.mozSetMessageHandler);
    if (navigator.mozSetMessageHandler) {
        navigator.mozSetMessageHandler('activity', function(req) {
            logger.log('Activity name: ', req.source.name);
            logger.log('Activity data: ', JSON.stringify(req.source.data));
            var msg = {
                name: req.source.name || '',
                data: req.source.data || {}
            };
            if (msg.name === 'marketplace-openmobile-acl') {
                // For each activity expecting a returnValue (at the moment
                // only "marketplace-openmobile-acl", keep the request around,
                // generating an unique id. When we receive back a message
                // saying an activity is done, if the id matches one we have,
                // post the result back to the activity caller).
                msg.id = getRandomInt(0, 9007199254740991);
                messages.activitiesInProgress[msg.id] = req;
                logger.log('This activity needs to return, generated id: ', msg.id);
                // 'marketplace-openmobile-acl' also needs to wait on a
                // getFeature() promise before sending the activity message.
                if (typeof navigator.getFeature !== 'undefined') {
                    navigator.getFeature('acl.version').then(function(val) {
                        logger.log('Sending activity with acl.version: ', val);
                        msg.data.acl_version = val;
                        messages.queueMessage(msg);
                    });
                }
                // Don't bother sending this one if getFeature() is absent.
                return;
            }
            messages.queueMessage(msg);
        });
    }
}

module.exports = {
    install: install,
};

},{"./logger":3,"./messages":5}],2:[function(require,module,exports){
var logger = require('./logger');

// Bump this number every time you add a feature. It must match zamboni's
// settings.APP_FEATURES_VERSION.
var APP_FEATURES_VERSION = 9;

// See zamboni docs for the order - it matters, we'll push promises in the same
// order to generate the features signature.
var FEATURES = [
    // false,  // Hardcoded boolean value.
    // 'mozApps' in navigator,  // Dynamic boolean value.
    // ['hardware.memory', 512],  // getFeature() with comparison.
    // 'api.window.MozMobileNetworkInfo',  // hasFeature().

    // We are only interested in a few features for now. We're already only
    // doing this if getFeature() is present, and it was introduced in 2.0, so
    // we know we can hardcode anything that comes with 2.0 and for which we
    // don't need to know the exact value.
    true, // 'getMobileIdAssertion' in window.navigator || 'api.window.Navigator.getMobileIdAssertion',
    true, // 'manifest.precompile',
    ['hardware.memory', 512],
    ['hardware.memory', 1024],
    true, // NFC
    'acl.version', // OpenMobile ACL,
    'api.window.UDPSocket',
];

function FeaturesBitField(size) {
    /**
     * Class that stores the bits into several 8-bit unsigned integers, and 
     * can import/export from/to base64. Designed that way to be compatible
     * with the way we read the features signature in Python.
    **/
    this.size = size;
    this.values = new Uint8Array(Math.ceil(this.size / 8));
}

FeaturesBitField.prototype.get = function(i) {
    var index = (i / 8) | 0;
    var bit = i % 8;
    return (this.values[index] & (1 << bit)) !== 0;
};

FeaturesBitField.prototype.set = function(i, value) {
    var index = (i / 8) | 0;
    var bit = i % 8;
    if (value) {
        this.values[index] |= 1 << bit;
    } else {
        this.values[index] &= ~(1 << bit);
    }
};

FeaturesBitField.prototype.toBase64 = function() {
    return btoa(String.fromCharCode.apply(null, this.values));
};


function buildFeaturesPromises(features, navigator) {
    navigator = navigator || window.navigator;
    var promises = [];
    // Execute getFeature('hardware.memory') immediately and store the promise
    // to be able to re-use it without making the call twice.
    var memoryPromise = navigator.getFeature('hardware.memory');

    features.forEach(function(key) {
        if (typeof key === 'boolean') {
            // Hardcoded boolean value, just pass it directly.
            promises.push(key);
        } else if (typeof key === 'string') {
            if (key === 'acl.version') {
                // This feature has a value, so we need to call
                // getFeature(), but we actually only care about the fact
                // that it's not empty, so we can just use the getFeature()
                // promise directly.
                promises.push(navigator.getFeature(key));
            } else if (typeof navigator.hasFeature !== 'undefined') {
                // Regular boolean feature: just call hasFeature().
                promises.push(navigator.hasFeature(key));
            } else {
                // We should be using hasFeature() but it's absent, return
                // false.
                promises.push(false);
            }
        } else {
            // We are dealing with a more complex case, where we need to
            // call getFeature() and compare against a value.
            var feature = key[0];
            var value = key[1];
            // We need to wrap the getFeature() Promise into one of our own
            // that does the comparison, so that we can just call
            // Promise.all later and get only booleans.
            promises.push(new Promise(function(resolve, reject) {
                var getFeaturePromise;
                if (feature == 'hardware.memory') {
                    getFeaturePromise = memoryPromise;
                } else {
                    getFeaturePromise = navigator.getFeature(feature);
                }
                getFeaturePromise.then(function(data) {
                    resolve(data >= value);
                });
            }));
        }
    });
    return Promise.all(promises);
}

function generateFeatureProfile(features, navigator) {
    navigator = navigator || window.navigator;
    features = features || FEATURES;
    return buildFeaturesPromises(features, navigator).then(function(values) {
        // Build the signature:
        // - First, get a binary representation of all the feature flags.
        //   the first 47 (!) are currently hardcoded as true.
        var hardcoded_len = 47;
        var bitfield = new FeaturesBitField(values.length + hardcoded_len);
        for (var i = 0; i < hardcoded_len; i++) {
            bitfield.set(i, true);
        }
        for (i = 0; i < values.length; i++) {
            bitfield.set(hardcoded_len + i, values[i]);
        }
        var profile = [
            // First part is the base64 string built from the bitfield
            // containing the results from all the values; A '=' is prepended
            // to indicate that it's going to be a base64 signature.
            '=' + bitfield.toBase64(),
            // Second part is the number of features;
            bitfield.size,
            // Last part is a hardcoded version number, to bump whenever
            // we make changes.
            APP_FEATURES_VERSION
        ].join('.');
        return profile;
    });
}

/*
 * Utility function that converts an object to an array of objects.
 * Used because Promise.all() does not accept an object for its iterable, it
 * really wants an array :(.
 */
function mapPromisesObjectToArray(obj) {
    // Function that returns a function to use as the promise callback.
    var makeArrayEntry = function(key) {
        return function(value) {
            return {name: key, value: value};
        };
    };

    return Object.keys(obj).map(function(key) {
        // Push a promise that resolves to a {name: ..., value: ...} object.
        return obj[key].then(makeArrayEntry(key));
    });
}

/*
 * Utility function that converts an array of objects to an object.
 * Companion to mapPromisesObjectToArray above.
 */
function mapArrayToObject(arr) {
    var obj = {};

    for (var i = 0; i < arr.length; i ++) {
        // Build the object from each {name: ..., value: ...} object in the
        // array.
        obj[arr[i].name] = arr[i].value;
    }

    return obj;
}

/**
 * Check for extra features that do not have feature flags.
 *
 * Returns a promise that is fulfilled when all checks are complete. Its value
 * is an object containing booleans indicating whether the features are
 * enabled, like this:
 * {
 *   addonsEnabled: true,
 *   homescreensEnabled: false,
 *   ...
 * }
 */
function checkForExtraFeatures(navigator) {
    navigator = navigator || window.navigator;

    if (typeof navigator.hasFeature === 'undefined') {
        return new Promise(function(resolve, reject) {
            // Resolve immediately with no data if we haven't hasFeature().
            resolve({});
        })
    }

   var promises = {
        addonsEnabled: navigator.hasFeature('web-extensions'),
        homescreensEnabled: navigator.hasFeature('manifest.role.homescreen'),
        lateCustomizationEnabled: navigator.hasFeature('late-customization'),
    };

    return Promise.all(mapPromisesObjectToArray(promises)).then(function(res) {
        return mapArrayToObject(res);
    });
}

module.exports = {
    FeaturesBitField: FeaturesBitField,
    buildFeaturesPromises: buildFeaturesPromises,
    checkForExtraFeatures: checkForExtraFeatures,
    generateFeatureProfile: generateFeatureProfile,
};

},{"./logger":3}],3:[function(require,module,exports){
function log() {
    // `console.log` wrapper that prefixes log statements.
    console.log('[yulelog]', Array.prototype.slice.call(arguments, 0).join(' '));
}

module.exports = {
    log: log,
};

},{}],4:[function(require,module,exports){
var activities = require('./activities');
var features = require('./features');
var logger = require('./logger');
var messages = require('./messages');
var translations = require('./translations');


logger.log('MKT_URL:', "https://orchidfoss.github.io/webstore");

function buildQS(profile, extraFeatures) {
    var qs = [];

    try {
        // navigator.mozMobileConnections is the new API.
        // navigator.mozMobileConnection is the legacy API.
        var conn = navigator.mozMobileConnections;
        var network;
        if (conn) {
            logger.log('navigator.mozMobileConnections available');
            var mccs = [];
            var connData;
            for (var i = 0; i < conn.length; i++) {
                connData = conn[i];
                // Testing lastKnownHomeNetwork first is important, because it's the
                // only one which contains the SPN.
                network = (connData.lastKnownHomeNetwork || connData.lastKnownNetwork || '-').split('-');
                logger.log('navigator.mozMobileConnections[' + i + '].lastKnownNetwork:',
                    connData.lastKnownNetwork);
                logger.log('navigator.mozMobileConnections[' + i + '].lastKnownHomeNetwork:',
                    conn.lastKnownHomeNetwork);
                mccs.push({mcc: network[0], mnc: network[1], spn: network[2]});
            }
            mccs = JSON.stringify(mccs);
            qs.push('mccs=' + mccs);
            logger.log('MCCs: ' + mccs);
        } else {
            logger.log('navigator.mozMobileConnections unavailable');

            conn = navigator.mozMobileConnection;
            if (conn) {
                logger.log('navigator.mozMobileConnection available');
                // `MCC`: Mobile Country Code
                // `MNC`: Mobile Network Code
                // `lastKnownHomeNetwork`: `{MCC}-{MNC}` (SIM's origin)
                // `lastKnownNetwork`: `{MCC}-{MNC}` (could be different network if roaming)
                network = (conn.lastKnownHomeNetwork || conn.lastKnownNetwork || '-').split('-');
                qs.push('mcc=' + (network[0] || ''));
                qs.push('mnc=' + (network[1] || ''));
                logger.log('navigator.mozMobileConnection.lastKnownNetwork:',
                    conn.lastKnownNetwork);
                logger.log('navigator.mozMobileConnection.lastKnownHomeNetwork:',
                    conn.lastKnownHomeNetwork);
                logger.log('MCC: "' + network[0] + '", MNC: "' + network[1] + '"');
            } else {
                logger.log('navigator.mozMobileConnection unavailable');
            }
        }
    } catch(e) {
        // Fail gracefully if `navigator.mozMobileConnection(s)`
        // gives us problems.
    }

    if ('id' in navigator) {
        qs.push('nativepersona=true');
    }

    if (profile) {
        logger.log('Generated profile: ' + profile);
        qs.push('pro=' + encodeURIComponent(profile));
    }

    if (extraFeatures) {
        Object.keys(extraFeatures).forEach(function(key) {
            logger.log(key + ': ' + extraFeatures[key]);
            if (extraFeatures[key]) {
                qs.push(key + '=true');
            }
        });
    }

    return qs.join('&');
}

// The iframe src is served over https, which means that if the system date
// is too far behind, the user will just end up seeing a certificate error.
// We check against an hardcoded year corresponding to the current certificate
// creation date, and display an error message if necessary.
function isSystemDateIncorrect() {
    logger.log('Checking for system date ...');
    var rval = new Date().getFullYear() < 2015;
    if (rval) {
        logger.log('System date appears to be incorrect!');
    } else {
        logger.log('System date appears to be OK.');
    }
    return rval;
}

if (isSystemDateIncorrect()) {
    document.body.classList.add('dateerror');

    document.querySelector('.try-again').addEventListener('click', function() {
        if (!isSystemDateIncorrect()) {
            window.location.reload();
        }
    }, false);
} else {
    // Build the iframe. If we have Promise and getFeature, we build the
    // profile signature first.
    if (typeof window.Promise !== 'undefined' &&
        typeof navigator.getFeature !== 'undefined') {
        logger.log('navigator.getFeature and window.Promise available');
        var allStartupPromises = Promise.all([
            features.generateFeatureProfile(),
            features.checkForExtraFeatures(),
        ]);
        allStartupPromises.then(function(promises) {
            var featureProfile = promises[0];
            var extraFeatures = promises[1];
            launchIframe(featureProfile, extraFeatures);
        });
    } else {
        logger.log('navigator.getFeature or window.Promise unavailable :(');
        launchIframe();
    }

    // When refocussing the app, toggle the iframe based on `navigator.onLine`.
    window.addEventListener('focus', toggleOffline, false);

    toggleOffline(true);

    document.querySelector('.try-again').addEventListener('click', function() {
        toggleOffline();
    }, false);
}

function launchIframe(profile, hasWebExtensions) {
    // Set the iframe src to the actual Web Store.
    var iframe = document.getElementById('iframe');
    iframe.onerror = function() {
        document.body.classList.add('offline');
    };
    iframe.src = "https://orchidfoss.github.io/webstore" +
                 '/?' + buildQS(profile, hasWebExtensions);
}

function toggleOffline(init) {
    logger.log('Checking for network connection ...');
    if (navigator.onLine === false) {
        // Hide iframe.
        logger.log('Network connection not found; hiding iframe ...');
        document.body.classList.add('offline');
    } else {
        // Show iframe.
        logger.log('Network connection found; showing iframe ...');
        if (!init) {
            // Reload the page to reload the iframe.
            window.location.reload();
        }
    }
}

// Set up messages, activities and translations late in order to load the
// iframe as quickly as possible.
translations.install();
messages.install();
activities.install();

},{"./activities":1,"./features":2,"./logger":3,"./messages":5,"./translations":6}],5:[function(require,module,exports){
var logger = require('./logger');


var activitiesInProgress = {};
var activitiesToSend = [];

function postMessage(win, msg) {
    logger.log('postMessaging to ' + "https://orchidfoss.github.io/webstore" + ': ' + JSON.stringify(msg));
    win.document.querySelector('iframe').contentWindow.postMessage(msg, "https://orchidfoss.github.io/webstore");
}

function sendActivities(win) {
    logger.log('Sending activities: ' + JSON.stringify(activitiesToSend));
    while (activitiesToSend.length) {
        postMessage(win, activitiesToSend.pop());
    }
    // The next time we try to append something to `activitiesToSend`,
    // we'll have already called this function (`sendActivities`)
    // so just postMessage the message (`msg`) immediately.
    activitiesToSend = {
        push: function(msg) {
            postMessage(win, msg);
        }
    };
}

function queueMessage(msg) {
    activitiesToSend.push(msg);
}

function install(window_, navigator) {
    var win = window_ || window;
    navigator = navigator || window.navigator;

    win.addEventListener('message', function(e) {
        // Receive postMessage from the iframe contents and do something with it.
        logger.log('Handled post message from ' + e.origin + ': ' + JSON.stringify(e.data));
        if (e.origin !== "https://orchidfoss.github.io/webstore") {
            logger.log('Ignored post message from ' + e.origin + ': ' + JSON.stringify(e.data));
            return;
        }
        if (e.data === 'loaded') {
            logger.log('Preparing to send activities ...');
            sendActivities(win);
        } else if (e.data.type === 'fxa-watch') {
            logger.log('Registering FxA callbacks');
            navigator.mozId.watch({
                wantIssuer: 'firefox-accounts',
                loggedInUser: e.data.email,
                onready: function() {},
                onlogin: function(a) {logger.log('fxa-login'); postMessage(win, {type: 'fxa-login', assertion: a});},
                onlogout: function() {logger.log('fxa-logout'); postMessage(win, {type: 'fxa-logout'});}
            });
        } else if (e.data.type === 'fxa-request') {
            navigator.mozId.request({oncancel: function(){postMessage(win, {type: 'fxa-cancel'});}});
        } else if (e.data.type == 'activity-result' && e.data.id && activitiesInProgress[e.data.id]) {
            logger.log('Posting back result for activity id:', e.data.id);
            activitiesInProgress[e.data.id].postResult(e.data.result);
            delete activitiesInProgress[e.data.id];
        } else if (e.data.type == 'activity-error' && e.data.id && activitiesInProgress[e.data.id]) {
            logger.log('Posting back error for activity id:', e.data.id);
            activitiesInProgress[e.data.id].postError(e.data.result);
            delete activitiesInProgress[e.data.id];
        }
    }, false);
}

module.exports = {
    activitiesInProgress: activitiesInProgress,
    install: install,
    queueMessage: queueMessage,
};

},{"./logger":3}],6:[function(require,module,exports){
function get_locale(locale) {
    var languages = [
        'bg', 'bn-BD', 'ca', 'cs', 'da', 'de', 'el', 'en-US', 'es', 'eu', 'fr',
        'ga-IE', 'hr', 'hu', 'it', 'ja', 'ko', 'mk', 'nb-NO', 'nl', 'pa',
        'pl', 'pt-BR', 'ro', 'ru', 'sk', 'sq', 'sr', 'sr-Latn', 'ta', 'tr',
        'xh', 'zh-CN', 'zh-TW', 'zu', 'dbg'
    ];

    var lang_expander = {
         'en': 'en-US', 'ga': 'ga-IE',
         'pt': 'pt-BR', 'sv': 'sv-SE',
         'zh': 'zh-CN', 'sr': 'sr-Latn'
    };

    if (languages.indexOf(locale) !== -1) {
        return locale;
    }
    locale = locale.split('-')[0];
    if (languages.indexOf(locale) !== -1) {
        return locale;
    }
    if (locale in lang_expander) {
        locale = lang_expander[locale];
        if (languages.indexOf(locale) !== -1) {
            return locale;
        }
    }
    return 'en-US';
}

function install() {
    var transName;
    var transBlocks = document.querySelectorAll('[data-l10n]');
    var qs_lang = /[\?&]lang=([\w\-]+)/i.exec(window.location.search);
    var locale = get_locale((qs_lang && qs_lang[1]) || navigator.language);
    var translations = {
        "offline-error-message": {
            "bg": "Извинявайте, трябва да сте свързани към мрежа, за да посетите Web Store.",
            "cs": "Omlouváme se, ale pro přístup k Web Store musíte být online.",
            "da": "Du skal være online for at få adgang til Web Store.",
            "de": "Es tut uns leid, Sie müssen online sein, um auf den Web Store zuzugreifen.",
            "el": "Λυπούμαστε, πρέπει να είστε συνδεδεμένοι στο διαδίκτυο για να χρησιμοποιήσετε το Web Store.",
            "en-US": "Sorry, you need to be online to access the Web Store.",
            "es": "Lo sentimos, necesitas estar conectado para acceder al Web Store.",
            "eu": "Sentitzen dugu, Web Store-era sartzeko linean egon behar duzu.",
            "fr": "Vous devez être en ligne pour accéder au Web Store.",
            "hu": "Elnézést, a Web Store eléréséhez internetkapcsolat szükséges.",
            "it": "Spiacenti, devi essere online per poter accedere al Web Store.",
            "ja": "申し訳ありませんが、Web Store へアクセスするにはインターネット接続が必要です。",
            "nb-NO": "Du må være tilkoblet for å få tilgang til Web Store.",
            "nl": "Sorry, u dient online te zijn om de Web Store te bezoeken.",
            "pa": "ਅਫਸੋਸ, ਮੰਡੀ ਵਰਤਣ ਲਈ ਤੁਹਾਨੂੰ ਆਨਲਾਈਨ ਹੋਣ ਦੀ ਲੋੜ ਹੈ।",
            "pl": "Przepraszamy, musisz być online, by mieć dostęp do Web Store.",
            "pt-BR": "Desculpe, você precisa estar on-line para acessar o Web Store.",
            "ru": "Для доступа к Web Store вам необходимо подключиться к сети.",
            "sk": "Ospravedlňujeme sa, ale pre prístup k službe Web Store musíte byť online.",
            "sq": "Na ndjeni, lypset të jeni i lidhur në linjë për të përdorur Web Store-in.",
            "sr": "Жао нам је, морате бити на мрежи да бисте приступили Web Store-у.",
            "sr-Latn": "Žao nam je, morate biti na mreži da biste pristupili Web Store-u.",
            "tr": "Üzgünüz, Web Store'e erişmek için çevrimiçi olmalısınız.",
            "xh": "Uxolo, kudingeka ube kwi-intaneti ukufikelela kwi-Web Store",
            "zh-CN": "抱歉，您需要在线才能访问应用市场。",
            "zh-TW": "抱歉，您必須連線到網路才能使用 Web Store。",
            "zu": "Siyaxolisa, kudingeka ukuthi ube semoyeni ukuze ukwazi ukufinyelela ku-Web Store.",
            "dbg": "Şǿřřẏ, ẏǿŭ ƞḗḗḓ ŧǿ ƀḗ ǿƞŀīƞḗ ŧǿ ȧƈƈḗşş ŧħḗ Ḿȧřķḗŧƥŀȧƈḗ."
        },
        "date-error-message": {
            "bg": "Извинявайте, часовникът на устройството е неточен.",
            "cs": "Omlouváme se, ale čas na vašem zařízení není nastaven korektně.",
            "da": "Beklager, men uret på din enhed ser ud til at være forkert indstillet.",
            "de": "Es tut uns leid, die Uhr Ihres Geräts scheint falsch eingestellt zu sein.",
            "el": "Λυπούμαστε, το ρολόι της συσκευής σας έχει ρυθμιστεί λανθασμένα. ",
            "en-US": "Sorry, your device clock appears to be set incorrectly.",
            "es": "Lo sentimos, el reloj de tu dispositivo parece estar configurado incorrectamente.",
            "eu": "Sentitzen dugu, dirudienez zure gailuaren erlojua gaizki konfiguratuta dago.",
            "fr": "Désolé, il semblerait que l'horloge de votre périphérique ne soit pas correctement configurée.",
            "hu": "Elnézést, úgy tűnik a készülék órája nem jól jár.",
            "it": "Spiacenti, l’orologio del dispositivo in uso sembra non essere impostato correttamente.",
            "ja": "申し訳ありませんが、お使いの端末の時刻設定が正しくないようです。",
            "nb-NO": "Beklager, men klokken på din enhet ser ut til å være feilinnstilt.",
            "nl": "Sorry, uw apparaatklok lijkt niet juist te zijn ingesteld.",
            "pa": "ਅਫਸੋਸ, ਤੁਹਾਡੇ ਯੰਤਰ ਦੀ ਘੜੀ ਗਲਤ ਚੱਲਦੀ ਜਾਪਦੀ ਹੈ।",
            "pl": "Przepraszamy, wygląda na to, że zegar twojego urządzenia jest ustawiony niepoprawnie.",
            "pt-BR": "Desculpe, o relógio do seu aparelho parece estar configurado incorretamente.",
            "ru": "К сожалению, похоже, что часы на вашем устройстве установлены неправильно.",
            "sk": "Ospravedlňujeme sa, ale čas na vašom zariadení nie je nastavený správne.",
            "sq": "Na ndjeni, ora e pajisjes suaj duket se nuk është rregulluar saktë.",
            "sr": "Жао нам је, изгледа да је Ваш сат уређаја погрешно подешен.",
            "sr-Latn": "Žao nam je, izgleda da je Vaš sat uređaja pogrešno podešen.",
            "tr": "Üzgünüz, cihazınızın saati yanlış ayarlanmış görünüyor.",
            "xh": "Uxolo, ixesha lesixhobo sakho libonakala lisetwe ngokungachanekanga.",
            "zh-CN": "抱歉，您的设备时钟似乎有误。",
            "zh-TW": "抱歉，您的裝置時間錯誤。",
            "zu": "Siyaxolisa, kubonakala sengathi iwashi ledivayisi yakho alihambi kahle.",
            "dbg": "Şǿřřẏ, ẏǿŭř ḓḗṽīƈḗ ƈŀǿƈķ ȧƥƥḗȧřş ŧǿ ƀḗ şḗŧ īƞƈǿřřḗƈŧŀẏ."
        },
        "date-error-message-suggestion": {
            "bg": "Моля, настройте датата и часа на устройството ви, за да посетите Web Store.",
            "cs": "Pro přístup k Web Store si prosím nastavte na svém zařízení aktuální datum a čas.",
            "da": "Indstil dags dato og klokkeslæt på din enhed for at få adgang til Web Store.",
            "de": "Bitte stellen Sie in Ihren Geräteeinstellungen das heutige Datum und die Uhrzeit ein, um auf den Web Store zuzugreifen.",
            "el": "Παρακαλούμε ρυθμίστε την σημερινή ημερομηνία και ώρα από τις ρυθμίσεις της συσκευής σας, για να αποκτήσετε πρόσβαση στο Web Store.",
            "en-US": "Please set today's date and time in your device settings to access the Web Store.",
            "es": "Por favor establece la fecha y hora de hoy en las opciones de tu dispositivo para poder acceder a Web Store.",
            "eu": "Ezarri gaurko eguna eta ordua zure gailuaren ezarpenetan Web Store-era sartzeko.",
            "fr": "Merci de configurer correctement la date et l'heure dans les paramètres de votre appareil pour pouvoir accéder au Web Store.",
            "hu": "Állítsa be a mai dátumot és időt a készülék beállításaiban a Web Store eléréséhez.",
            "it": "Imposta ora e data correnti nelle impostazioni del dispositivo per accedere al Web Store.",
            "ja": "端末の設定で現在の日時を正しく設定してから Web Store へアクセスしてください。",
            "nb-NO": "Sett dagens dato og klokkeslett i enhetsinnstillingene for å få tilgang til Web Store.",
            "nl": "Stel in uw apparaatinstellingen de datum en tijd van vandaag in om de Web Store te benaderen.",
            "pa": "ਮੰਡੀ ਦੀ ਵਰਤੋਂ ਕਰਨ ਲਈ ਆਪਣੇ ਯੰਤਰ ਦੀ ਸੈਟਿੰਗ ਵਿੱਚ ਅੱਜ ਦਾ ਸਮਾਂ ਤੇ ਮਿਤੀ ਦਿਉ।",
            "pl": "Ustaw dzisiejszą datę i czas w ustawieniach swojego urządzenia, by mieć dostęp do Web Store.",
            "pt-BR": "Por favor, atualize a data e a hora do seu aparelho para acessar o Web Store.",
            "ru": "Пожалуйста, установите текущую дату и время в настройках вашего устройства для доступа к Web Store.",
            "sk": "Pre prístup k službe Web Store si prosím nastavte na svojom zariadení aktuálny dátum a čas.",
            "sq": "Ju lutemi, që të përdorni Web Store-in, rregulloni te pajisja juaj datën e sotme dhe orën e tanishme.",
            "sr": "Молимо подесите данашњи датум и време у поставкама Вашег уређаја да бисте приступили Web Store-у.",
            "sr-Latn": "Molimo podesite današnji datum i vreme u postavkama Vašeg uređaja da biste pristupili Web Store-u.",
            "tr": "Web Store'e erişmek için lütfen cihaz ayarlarınızdan bugünün tarihini ve saatini ayarlayın.",
            "xh": "Nceda usete umhla nexesha lanamhlanje kwiisetingi zesixhobo sakho ukufikelela kwi-Web Store.",
            "zh-CN": "请在您的设备设置中设置今天的日期和时间以访问应用市场。",
            "zh-TW": "請將您的裝置時間設定至今天以使用 Web Store。",
            "zu": "Uyacelwa usethe usuku lwanamuhla kanye nesikhathi kumasethingi edivayisi yakho ukuze ukwazi ukufinyelela ku-Web Store.",
            "dbg": "Ƥŀḗȧşḗ şḗŧ ŧǿḓȧẏ'ş ḓȧŧḗ ȧƞḓ ŧīḿḗ īƞ ẏǿŭř ḓḗṽīƈḗ şḗŧŧīƞɠş ŧǿ ȧƈƈḗşş ŧħḗ Ḿȧřķḗŧƥŀȧƈḗ."
        },
        "try-again": {
            "bg": "Повторен опит",
            "cs": "Zkusit znovu",
            "da": "Prøv igen",
            "de": "Erneut versuchen",
            "el": "Προσπαθήστε ξανά",
            "en-US": "Try again",
            "es": "Intenta de nuevo",
            "eu": "Saiatu berriro",
            "fr": "Réessayer",
            "hu": "Újra",
            "it": "Riprova",
            "ja": "再読み込み",
            "nb-NO": "Prøv igjen",
            "nl": "Opnieuw proberen",
            "pa": "ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ",
            "pl": "Spróbuj ponownie",
            "pt-BR": "Tente novamente",
            "ru": "Попробовать снова",
            "sk": "Skúsiť znova",
            "sq": "Riprovoni",
            "sr": "Покушај поново",
            "sr-Latn": "Pokušaj ponovo",
            "tr": "Tekrar dene",
            "xh": "Zama kwakhona",
            "zh-CN": "重试",
            "zh-TW": "重試",
            "zu": "Zama futhi",
            "dbg": "Ŧřẏ ȧɠȧīƞ"
        }
    };
    for (var i = 0; i < transBlocks.length; i++) {
        transName = transBlocks[i].dataset.l10n;
        if (transName in translations && locale in translations[transName]) {
            transBlocks[i].innerHTML = translations[transName][locale];
        }
    }
}

module.exports = {
    install: install,
};

},{}]},{},[4]);
