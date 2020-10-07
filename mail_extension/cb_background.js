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
// Definition and implementation of the link-generators
//

var link_types = [
    {
        text    : 'cbthunderlink', 
        to_link : function(m) { return to_cbthunderlink(m) }
    },
    {
        text    : 'thunderlink', 
        to_link : function(m) { return to_thunderlink(m) }
    }
]

async function to_cbthunderlink(the_message) {
    let link = "cbthunderlink://" + btoa(the_message.date.toJSON() + ";" + the_message.author)
    return link
}

async function to_thunderlink(the_message) {
    let full = await messenger.messages.getFull(the_message.id)
    let msg_id = full.headers['message-id'][0]
    msg_id = msg_id.replace(/^</,'').replace(/>$/,'')
    let link = "thunderlink://messageid=" + msg_id
    return link
}

//
// Build the context menu for generating a link.
//

async function create_context_menu() {

    let main_context_menu = {
        contexts : ['message_list'],
        title    : 'cb_thunderlink',
        id       : 'main_context_menu'
    }

    main_context_id = await browser.menus.create(main_context_menu)

    for (let i=0; i<link_types.length; i++) {

        let sub_context_menu = {
            contexts : ['message_list'],
            title    : link_types[i].text,
            parentId : main_context_id,
            id       : 'sub_context_menu_' + i,
            onclick  : on_context_menu
        }

        browser.menus.create(sub_context_menu)
    }
}

create_context_menu()

//
// Do our link generating action according to the submenu clicked. 
// Get it to the clipboard.
//

async function on_context_menu(e) {
    let the_message = e.selectedMessages.messages[0]
    let idx = e.menuItemId.replace('sub_context_menu_', '')
    let link = await link_types[idx].to_link(the_message)
    navigator.clipboard.writeText(link)
}

//
// Start our accompanying python script.
// See : https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging
//

var port = browser.runtime.connectNative("cb_thunderlink")

//
// Here we listen to message we might receive from our accompanying python script.
// If so, it is the identifier with date/author that we use for querying the messages.
// The one found, we 'goto'.
// Currently it is always opened in "three_pane", but "new_tab" or "new_window" is available
// as well. This is waiting for configuration.
//

async function cb_goto(encoded_link) {
    let decoded_link = atob(encoded_link)
    let date_auth = decoded_link.split(";")
    console.log("cb_background received: " + date_auth)
    let the_date = new Date(date_auth[0])
    let the_author = date_auth[1]
    let the_query = {
        author   : the_author,
        fromDate : the_date,
        toDate   : the_date
    }
    messenger.messages.query(the_query).then(ml => {
        let the_message = ml.messages[0]
        messenger.cb_api.cb_show_message(the_message.id, "three_pane")
    })
}



port.onMessage.addListener((encoded_link) => {
    cb_goto(encoded_link)
})

messenger.browserAction.onClicked.addListener(() => {
    navigator.clipboard.readText().then(clip => {
        if (!clip.startsWith('cbthunderlink://')) {
            console.error("Don't bother a link like: " + clip)
            return
        }
        let encoded_link = clip.replace('cbthunderlink://', '')
        cb_goto(encoded_link)
    })
})

// vim: syntax=javascript ts=4 sw=4 sts=4 sr et columns=100
