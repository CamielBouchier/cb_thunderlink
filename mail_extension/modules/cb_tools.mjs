
/* Port of strftime() by T. H. Doan (https://thdoan.github.io/strftime/)
 *
 * Day of year (%j) code based on Joe Orost's answer:
 * http://stackoverflow.com/questions/8619879/javascript-calculate-the-day-of-the-year-1-366
 *
 * Week number (%V) code based on Taco van den Broek's prototype:
 * http://techblog.procurios.nl/k/news/view/33796/14863/calculate-iso-8601-week-and-year-in-javascript.html
 */

export function strftime(sFormat, date) {
    if (!(date instanceof Date)) date = new Date();
    var nDay = date.getDay(),
        nDate = date.getDate(),
        nMonth = date.getMonth(),
        nYear = date.getFullYear(),
        nHour = date.getHours(),
        aDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        aMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        aDayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
        isLeapYear = function () {
            return (nYear % 4 === 0 && nYear % 100 !== 0) || nYear % 400 === 0;
        },
        getThursday = function () {
            var target = new Date(date);
            target.setDate(nDate - ((nDay + 6) % 7) + 3);
            return target;
        },
        zeroPad = function (nNum, nPad) {
            return ((Math.pow(10, nPad) + nNum) + '').slice(1);
        };
    return sFormat.replace(/%[a-z]/gi, function (sMatch) {
        return (({
            '%a': aDays[nDay].slice(0, 3),
            '%A': aDays[nDay],
            '%b': aMonths[nMonth].slice(0, 3),
            '%B': aMonths[nMonth],
            '%c': date.toUTCString(),
            '%C': Math.floor(nYear / 100),
            '%d': zeroPad(nDate, 2),
            '%e': nDate,
            '%F': date.toISOString().slice(0, 10),
            '%G': getThursday().getFullYear(),
            '%g': (getThursday().getFullYear() + '').slice(2),
            '%H': zeroPad(nHour, 2),
            '%I': zeroPad((nHour + 11) % 12 + 1, 2),
            '%j': zeroPad(aDayCount[nMonth] + nDate + ((nMonth > 1 && isLeapYear()) ? 1 : 0), 3),
            '%k': nHour,
            '%l': (nHour + 11) % 12 + 1,
            '%m': zeroPad(nMonth + 1, 2),
            '%n': nMonth + 1,
            '%M': zeroPad(date.getMinutes(), 2),
            '%p': (nHour < 12) ? 'AM' : 'PM',
            '%P': (nHour < 12) ? 'am' : 'pm',
            '%s': Math.round(date.getTime() / 1000),
            '%S': zeroPad(date.getSeconds(), 2),
            '%u': nDay || 7,
            '%V': (function () {
                var target = getThursday(),
                    n1stThu = target.valueOf();
                target.setMonth(0, 1);
                var nJan1 = target.getDay();
                if (nJan1 !== 4) target.setMonth(0, 1 + ((4 - nJan1) + 7) % 7);
                return zeroPad(1 + Math.ceil((n1stThu - target) / 604800000), 2);
            })(),
            '%w': nDay,
            '%x': date.toLocaleDateString(),
            '%X': date.toLocaleTimeString(),
            '%y': (nYear + '').slice(2),
            '%Y': nYear,
            '%z': date.toTimeString().replace(/.+GMT([+-]\d+).+/, '$1'),
            '%Z': date.toTimeString().replace(/.+\((.+?)\)$/, '$1')
        }[sMatch] || '') + '') || sMatch;
    });
}

//
// https://base64.guru/developers/javascript/examples/unicode-strings
//
// ASCII to Unicode (decode Base64 to original data)
// @param {string} b64
// @return {string}
//

export function atou(b64) {
    return decodeURIComponent(escape(atob(b64)));
}

//
// https://base64.guru/developers/javascript/examples/unicode-strings
//
// Unicode to ASCII (encode data to Base64)
// @param {string} data
// @return {string}
//

export function utoa(data) {
    return btoa(unescape(encodeURIComponent(data)));
}


async function getFoldersWithNames(names) {
    if (names && names.length > 0) {
        return await browser.folders.query({
            name:{regexp:`(${names.map(e => `^${e}$`).join("|")})`}
        });
    }
    return [];
}

async function open_message({headerMessageId, messageId, open_mode}) {
    // open_mode: 
    //  - new_tab | new_window -> browser.messageDisplay.open()
    //  - three_pane -> mailTabs.setSelectedMessage()
    
    switch (open_mode) {
        case "three_pane":
            if (headerMessageId) {
                throw new Error("browser.mailTabs.setSelectedMessages() does not support setting a headerMessageId");
            }
            await browser.mailTabs.setSelectedMessages([messageId]);
            break;
        case "new_tab":
            await browser.messageDisplay.open({
                location: "tab",
                messageId,
                headerMessageId,
            });
            break;
        case "new_window":
            await browser.messageDisplay.open({
                location: "window",
                messageId,
                headerMessageId
            });
        default:
            throw new Error(`Unknown open_mode: ${open_mode}`)
    }
}

export async function cb_show_message_from_thunderlink(link, open_mode, settings) {
    const headerMessageId = link.replace('messageid=', '')
    const prefer_folders = await getFoldersWithNames(settings.prefer_folders);
    const avoid_folders = await getFoldersWithNames(settings.avoid_folders);
    // If we do not have prefer/avoid folders and open_mode is not three_pane,
    // use open_message() with the headerMessageId directly. This opens the last
    // known message with that headerMessageId. Throws if messageId is not known.
    if (
        prefer_folders.length == 0 && 
        avoid_folders.length == 0 &&
        // API does not yet support opening a message via its headerMessageId in the
        // three pane. 
        open_mode != "three_pane" 
    ) {
        try {
            return await open_message({headerMessageId, open_mode});
        } catch (ex) {
            console.info(`Message with id <${headerMessageId}> not found in cache, performing a full search.`);
        }
    }

    // To speed up search, we first search the preferred folders, if specified.
    let prefer_folder_ids = prefer_folders.map(f => f.id)
    if (prefer_folder_ids.length > 0) {
        let page = await browser.messages.query({
            headerMessageId,
            folderId: prefer_folder_ids,
            includeSubFolders: false,
            messagesPerPage: 1
        });
        if (page.id) {
            await browser.messages.abortList(page.id)
        }
        if (page.messages.length) {
            return open_message({messageId: page.messages[0].id, open_mode});
        }
    }

    // We either did not have preferred folders, or the message was not found in
    // the preferred folders. Search again in all folders except in the folders
    // we already searched and also not in the avoided folders.
    // We also skip subfolders of avoided folders.
    let search_folders = (await browser.folders.query({isVirtual: false, isRoot: false })).filter(f => 
        !prefer_folder_ids.includes[f.id] &&
        !avoid_folders.some(f => f.path.startsWith(f.path))
    );
    let search_folder_ids = search_folders.map(f => f.id);
    let page = await browser.messages.query({
        headerMessageId,
        folderId: search_folder_ids,
        includeSubFolders: false,
        messagesPerPage: 1
    });
    
    if (page.id) {
        await browser.messages.abortList(page.id)
    }
    if (page.messages.length) {
        return open_message({messageId: page.messages[0].id, open_mode});
    }

    // No message was found.
    console.error(`Message with id <${headerMessageId}> not found. Collection:`, search_folders);
}

export async function cb_show_message_from_cbthunderlink(link, open_mode, settings) {
    let decoded_link = atou(link)
    let date_auth = decoded_link.split(";")
    let the_date = new Date(date_auth[0])
    let the_author = date_auth[1]
    let the_query = {
        author: the_author,
        fromDate: the_date,
        toDate: the_date
    }
    let ml = await messenger.messages.query(the_query)
    let the_message = null
    for (let idx = 0; idx < ml.messages.length; idx++) {
        let folder = ml.messages[idx].folder
        if (settings.prefer_folders.includes(folder.name)) {
            the_message = ml.messages[idx]
            break
        }
    }
    if (!the_message) {
        for (let idx = 0; idx < ml.messages.length; idx++) {
            let folder = ml.messages[idx].folder
            if (!settings.avoid_folders.includes(folder.name)) {
                the_message = ml.messages[idx]
                break
            }
        }
    }
    if (!the_message && ml.messages.length) {
        the_message = ml.messages[0]
    }
    if (!the_message) {
        console.error("Investigate me. the_message == null. ml:", ml)
        return
    }

    return open_message({messageId: the_message.id, open_mode});
}