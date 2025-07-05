//
// $BeginLicense$
//
// (C) 2020-2021 by Camiel Bouchier (camiel@bouchier.be)
//
// This file is part of cb_thunderlink.
//
// License: Mozilla Public License Version 2.0
// (https://github.com/CamielBouchier/cb_thunderlink/blob/main/LICENSE)
//
// $EndLicense$
//

console.log("cb_background started")

import {
    strftime,
    utoa,
    cb_show_message_from_cbthunderlink,
    cb_show_message_from_thunderlink
} from "./modules/cb_tools.mjs"

const default_settings = {
    open_mode: "three_pane",
    avoid_folders: [],
    prefer_folders: [],
    conf_links: {
        0: { enable: true, name: "cbthunderlink", value: "cbthunderlink://$cblink$" },
        1: { enable: true, name: "thunderlink", value: "thunderlink://messageid=$msgid$" },
    },
    now_strftime_format: "%d-%m-%Y %H:%M:%S"
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
        await browser.storage.local.set({ cb_thunderlink: settings })
    } else {
        settings = {
            open_mode: config.cb_thunderlink.open_mode,
            avoid_folders: config.cb_thunderlink.avoid_folders,
            prefer_folders: config.cb_thunderlink.prefer_folders,
            conf_links: config.cb_thunderlink.conf_links,
            now_strftime_format: config.cb_thunderlink.now_strftime_format
        }
        if (!settings.open_mode) {
            settings.open_mode = default_settings.open_mode
            await browser.storage.local.set({ cb_thunderlink: settings })
        }
        if (!settings.avoid_folders) {
            settings.avoid_folders = default_settings.avoid_folders
            await browser.storage.local.set({ cb_thunderlink: settings })
        }
        if (!settings.prefer_folders) {
            settings.prefer_folders = default_settings.prefer_folders
            await browser.storage.local.set({ cb_thunderlink: settings })
        }
        if (!settings.conf_links) {
            settings.conf_links = default_settings.conf_links
            await browser.storage.local.set({ cb_thunderlink: settings })
        }
        if (!settings.now_strftime_format) {
            settings.now_strftime_format = default_settings.now_strftime_format
            await browser.storage.local.set({ cb_thunderlink: settings })
        }
    }
    // A change could require a new context menu setting.
    create_context_menu()
}

browser.storage.onChanged.addListener((what, area) => {
    if (area == 'local' && what.cb_thunderlink) {
        get_settings()
    }
})

await get_settings() // Actually will kick us of, generating the context menus.



//
// Link generator
//

async function link_to_clipboard(idx, the_message, selected_text) {
    let link = settings.conf_links[idx].value

    // Following few lines are +/- from original thunderlink.
    // replacing double quotes so they are escaped for JSON.parse
    link = link.replace(/["]/g, "\\\"")
    // convert escape characters like \t to tabs
    link = JSON.parse("\"" + link + "\"")

    let full = await messenger.messages.getFull(the_message.id)

    let author = the_message.author
    let date = the_message.date
    let subject = the_message.subject
    let cblink = utoa(date.toJSON() + ";" + author)
    let msgid = full.headers['message-id'][0].replace(/^</, '').replace(/>$/, '')

    // Extract author name and email. This recognizes "foo@bar" or "Foo bar <foo@bar>"
    // after removing all double quotes. Perhaps there is a more robust way.
    let author_name = ''
    let author_email = ''
    let author_match = author.replace(/["]/g, '').match(/^((.*)\s+<)?([^@<\s]+@[^@\s>]+)>?$/)
    if (author_match) {
        author_name = author_match[2]
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

    // https://github.com/CamielBouchier/cb_thunderlink/issues/43 : Adding now time
    let now_date_time = strftime(settings.now_strftime_format)

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
    link = link.replace(/\$selected_text\$/ig, selected_text ?? "")
    link = link.replace(/\$now\$/ig, now_date_time)
    await navigator.clipboard.writeText(link);
}

//
// Build the context menus for generating a link.
//

async function create_context_menu() {

    browser.menus.removeAll() // We might be called several times (get_settings!)

    let main_context_menu = {
        contexts: ['message_list'],
        title: 'cb_thunderlink',
        id: 'main_context_menu'
    }
    let main_context_id = await browser.menus.create(main_context_menu)

    let selection_context_menu = {
        contexts: ['selection', 'tab', 'page'],
        title: 'cb_thunderlink',
        id: 'selection_context_menu'
    };
    let selection_context_id = await browser.menus.create(selection_context_menu);

    // gather enabled configured links
    let conf_links = settings.conf_links;

    for (let [i, conf_link] of Object.entries(conf_links)) {

        // ignore disabled links
        if (!conf_link.enable) {
            continue;
        }

        // add sub menu entry to the message_list menu
        browser.menus.create({
            contexts: ['message_list'],
            title: conf_link.name,
            parentId: main_context_id,
            id: 'sub_context_menu_' + i
        });

        // add sub menu entry to the selection menu
        browser.menus.create({
            contexts: ['selection', 'tab', 'page'],
            title: conf_link.name,
            parentId: selection_context_id,
            id: 'other_menu_' + i
        });
    }
    
    browser.menus.onClicked.addListener((info, tab) => {
        if (info.menuItemId.startsWith('sub_context_menu_')) {
            on_context_menu(info)
        }
        if (info.menuItemId.startsWith('other_menu_')) {
            on_context_menu_selection(info, tab)
        }
    })
}

//
// Do our link generating action according to the submenu clicked.
// Get it to the clipboard.
//

async function on_context_menu(e) {
    let the_message = e.selectedMessages.messages[0]
    let idx = e.menuItemId.replace('sub_context_menu_', '')
    await link_to_clipboard(idx, the_message)
}

//
// Handle menu entries from the right click menu in a (message) tab
//
async function on_context_menu_selection(info, tab) {
    let idx = info.menuItemId.replace('other_menu_', '')
    let message = await messenger.messageDisplay.getDisplayedMessage(tab.id);

    if (!message) {
        console.error(`Could not find message in tab #${tab.id} (probably not a message tab?)`);
        return false;
    }

    let selected_text = info.selectionText;
    await link_to_clipboard(idx, message, selected_text);
}

//
// Also trigger the link generating action from keyboard shortcuts.
//

browser.commands.onCommand.addListener(async (command) => {
    let copy_link_match = command.match(/^copy_link_(\d+)$/)
    if (copy_link_match) {
        let idx = copy_link_match[1] - 1
        if (settings.conf_links[idx].enable) {
            let tab_query = { active: true, currentWindow: true }
            messenger.tabs.query(tab_query).then(tabs => {
                messenger.messageDisplay.getDisplayedMessage(tabs[0].id).then((message) => {
                    link_to_clipboard(idx, message)
                })
            })
        }
    }
    let drop_link_match = command.match(/^drop_link$/)
    if (drop_link_match) {
        let incoming_link = await navigator.clipboard.readText()
        handle_incoming_link(incoming_link)
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

    switch (link_type) {
        case "cbthunderlink":
            cb_show_message_from_cbthunderlink(link, open_mode, settings);
            break;
        case "thunderlink":
            cb_show_message_from_thunderlink(link, open_mode, settings)
            break;
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
