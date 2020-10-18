//
// $BeginLicense$
//
// (C) 2020 by Camiel Bouchier (camiel@bouchier.be)
//
// This file is part of cb_thunderlink.
// All rights reserved.
//
// $EndLicense$
//

console.log("cb_background started")

//
//
//

const default_settings = {
    open_mode : "three_pane",
    avoid_folders : [],
    prefer_folders : [],
    conf_links : {
        0 : {enable: true, name: "cbthunderlink", value: "cbthunderlink://$cblink$"},
        1 : {enable: true, name: "thunderlink",   value: "thunderlink://messageid=$msgid$"},
    }
}

var settings = default_settings

//
// This will get settings from the local storage.
// If no local storage would exist for cb_thunderbird, or it is incomplete, it will be completed.
// Finally, as each change of settings could result in a new context_menu, that is called as well.
//

async function get_settings() {
    let config = await browser.storage.local.get('cb_thunderlink')
    if (!config.cb_thunderlink) {
        await browser.storage.local.set({cb_thunderlink: settings})
    } else {
        settings = {
            open_mode      : config.cb_thunderlink.open_mode,
            avoid_folders  : config.cb_thunderlink.avoid_folders,
            prefer_folders : config.cb_thunderlink.prefer_folders,
            conf_links     : config.cb_thunderlink.conf_links
        }
        if (!settings.open_mode) {
            settings.open_mode = default_settings.open_mode
            await browser.storage.local.set({cb_thunderlink: settings})
        }
        if (!settings.avoid_folders) {
            settings.avoid_folders = default_settings.avoid_folders
            await browser.storage.local.set({cb_thunderlink: settings})
        }
        if (!settings.prefer_folders) {
            settings.prefer_folders = default_settings.prefer_folders
            await browser.storage.local.set({cb_thunderlink: settings})
        }
        if (!settings.conf_links) {
            settings.conf_links = default_settings.conf_links
            await browser.storage.local.set({cb_thunderlink: settings})
        }
    }
    // A change could require a new context menu setting.
    create_context_menu()
}

browser.storage.onChanged.addListener(
    function(what,area) {
        if (area == 'local' && what.cb_thunderlink) {
            get_settings()
        }
    })

get_settings() // Actually will kick us of, generating the context menus.

// 
// https://base64.guru/developers/javascript/examples/unicode-strings
//
// ASCII to Unicode (decode Base64 to original data)
// @param {string} b64
// @return {string}
//

function atou(b64) {
  return decodeURIComponent(escape(atob(b64)));
}

// 
// https://base64.guru/developers/javascript/examples/unicode-strings
//
// Unicode to ASCII (encode data to Base64)
// @param {string} data
// @return {string}
//

function utoa(data) {
  return btoa(unescape(encodeURIComponent(data)));
}

//
// Link generator
//

async function link_to_clipboard(idx, the_message) {

    let link = settings.conf_links[idx].value

    // Following few lines are +/- from original thunderlink.
    // replacing double quotes so they are escaped for JSON.parse
    link = link.replace(/["]/g, "\\\"")
    // convert escape characters like \t to tabs
    link = JSON.parse("\"" + link + "\"")

    let full = await messenger.messages.getFull(the_message.id)

    let author  = the_message.author
    let date    = the_message.date
    let subject = the_message.subject
    let cblink  =  utoa(date.toJSON() + ";" + author)
    let msgid   = full.headers['message-id'][0].replace(/^</,'').replace(/>$/,'')

    // Extract author name and email. This recognizes "foo@bar" or "Foo bar <foo@bar>"
    // after removing all double quotes. Perhaps there is a more robust way.
    let author_name  = ''
    let author_email = ''
    let author_match = author.replace(/["]/g,'').match(/^((.*)\s+<)?([^@<\s]+@[^@\s>]+)>?$/)
    if (author_match) {
	    author_name  = author_match[2]
	    author_email = author_match[3]
    }

    // Following few lines are +/- from original thunderlink.
    let date_time = new Date(date)
    let date_time_iso = date_time.toISOString()
    let date_time_iso_match = date_time_iso.match(/^(.*)T(.*)\.\d{3}Z$/)
    let date_iso = date_time_iso_match[1]
    let time_iso = date_time_iso_match[2]
    let date_locale = date_time.toLocaleDateString()
    let time_locale = date_time.toLocaleTimeString()

    // Following few lines are +/- from original thunderlink.
    // replace a few characters that frequently cause trouble
    // with a focus on org-mode, provided as filtered_subject
    let subject_filtered = subject.split("[").join("(")
    subject_filtered = subject_filtered.split("]").join(")")
    subject_filtered = subject_filtered.replace(/[<>'"`´]/g, "")

    link = link.replace(/\$msgid\$/ig, msgid)
    link = link.replace(/\$cblink\$/ig, cblink)
    link = link.replace(/\$author\$/ig, author)
    link = link.replace(/\$author_name\$/ig, author_name)
    link = link.replace(/\$author_email\$/ig, author_email)
    link = link.replace(/\$date\$/ig, date_time)
    link = link.replace(/\$date_iso\$/ig, date_iso)
    link = link.replace(/\$date_locale\$/ig, date_locale)
    link = link.replace(/\$time_iso\$/ig, time_iso)
    link = link.replace(/\$time_locale\$/ig, time_locale)
    link = link.replace(/\$subject\$/ig, subject)
    link = link.replace(/\$subject_filtered\$/ig, subject_filtered)

    navigator.clipboard.writeText(link)
}

//
// Build the context menu for generating a link.
//

async function create_context_menu() {

    browser.menus.removeAll() // We might be called several times (get_settings!)

    let main_context_menu = {
        contexts : ['message_list'],
        title    : 'cb_thunderlink',
        id       : 'main_context_menu'
    }
    let main_context_id = await browser.menus.create(main_context_menu)

    let conf_links = settings.conf_links
    for (const i in conf_links) {
        let conf_link = conf_links[i]
        if (!conf_link.enable) continue
        let sub_context_menu = {
            contexts : ['message_list'],
            title    : conf_link.name,
            parentId : main_context_id,
            id       : 'sub_context_menu_' + i,
            onclick  : on_context_menu
        }
        browser.menus.create(sub_context_menu)
    }
}

//
// Do our link generating action according to the submenu clicked.
// Get it to the clipboard.
//

async function on_context_menu(e) {
    let the_message = e.selectedMessages.messages[0]
    let idx = e.menuItemId.replace('sub_context_menu_', '')
    link_to_clipboard(idx, the_message)
}

//
// Also trigger the link generating action from keyboard shortcuts.
//

browser.commands.onCommand.addListener(async (command) => {
    let copy_link_match = command.match(/^copy_link_(\d+)$/)
    if (copy_link_match) {
	    let idx = copy_link_match[1]-1
	    if (settings.conf_links[idx].enable) {
	        let tab_query = {active: true, currentWindow: true}
	        messenger.tabs.query(tab_query).then(tabs => {
		        messenger.messageDisplay.getDisplayedMessage(tabs[0].id).then((message) => {
		            link_to_clipboard(idx, message)
		        })
	        })
	    }
    }
})

//
// Handle incoming link (be it by button, be it by script)
//

async function handle_incoming_link(incoming_link) {

    console.log("handle_incoming_link", incoming_link)

    let open_mode = settings.open_mode

    let match = /((cb)?thunderlink):\/\/([^\s\]]+)/.exec(incoming_link)
    let link_type = match[1]
    let link = match[3]

    if (link_type == 'cbthunderlink') {
        let decoded_link = atou(link)
        let date_auth = decoded_link.split(";")
        let the_date = new Date(date_auth[0])
        let the_author = date_auth[1]
        let the_query = {
            author   : the_author,
            fromDate : the_date,
            toDate   : the_date
        }
        let ml = await messenger.messages.query(the_query)
        let the_message = null
        for (let idx=0; idx<ml.messages.length; idx++) {
            let folder = ml.messages[idx].folder
            if (settings.prefer_folders.includes(folder.name)) {
                the_message = ml.messages[idx]
                break
            }
        }
        if (!the_message) {
            for (let idx=0; idx<ml.messages.length; idx++) {
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
            console.error("Investigate me. the_message == null. ml:",ml)
            return
        }
        messenger.cb_api.cb_show_message_from_api_id(the_message.id, open_mode)
    }

    if (link_type == 'thunderlink') {
        msg_id =  link.replace('messageid=', '')
        messenger.cb_api.cb_show_message_from_msg_id(msg_id, 
                                                     open_mode, 
                                                     settings.prefer_folders,
                                                     settings.avoid_folders)
    }
}

//
// Listen to incoming links on the browserAction.
//

messenger.browserAction.onClicked.addListener(async () => {
    let incoming_link = await navigator.clipboard.readText()
    handle_incoming_link(incoming_link)
})

//
// Start our accompanying python script.
// See : https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging
//

var port = browser.runtime.connectNative("cb_thunderlink")

port.onMessage.addListener((encoded_link) => {
    handle_incoming_link(encoded_link)
})

// vim: syntax=javascript ts=4 sw=4 sts=4 sr et columns=100
