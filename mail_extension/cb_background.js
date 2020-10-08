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
    return format_link(link, the_message) 
}

async function to_thunderlink(the_message) {
    let full = await messenger.messages.getFull(the_message.id)
    let msg_id = full.headers['message-id'][0]
    msg_id = msg_id.replace(/^</,'').replace(/>$/,'')
    let link = "thunderlink://messageid=" + msg_id
    return format_link(link, the_message) 
}

async function format_link(the_link, the_message) {
    let format_string = "<link>"
    let config = await browser.storage.local.get('cb_thunderlink')
    if (config.cb_thunderlink.format_string) {
        format_string = config.cb_thunderlink.format_string
    }

    // This is +/- from original thunderlink.
    let result = await convert_escape_characters(format_string)
    result = result.replace(/<link>/ig, the_link)

    // <subject> <filteredSubject>
    let subject = the_message.subject
    // replace a few characters that frequently cause trouble
    // with a focus on org-mode, provided as filteredSubject
    let protectedSubject = subject.split("[").join("(")
    protectedSubject = protectedSubject.split("]").join(")")
    protectedSubject = protectedSubject.replace(/[<>'"`´]/g, "")
    result = result.replace(/<subject>/ig, subject)
    result = result.replace(/<filteredSubject>/ig, protectedSubject)

    // <sender> <senderName> <senderEmail>
    let author = the_message.author
    result = result.replace(/<sender>/ig, author)
    // result = result.replace(/<sender>/ig, author.fullAddresses[0])
    // result = result.replace(/<senderName>/ig, author.names[0])
    // result = result.replace(/<senderEmail>/ig, author.addresses[0])

    // <date> <time> <dateTime> <localeTime>
    let date = new Date(the_message.date / 1000)
    let isoDate = date.toISOString()
    let splitDateTime = date.toISOString().split("T")
    let dateString = splitDateTime[0]
    let timeString = splitDateTime[1].substring(0, splitDateTime[1].length-1)
    let localeDateString = date.toLocaleDateString() + " - " + date.toLocaleTimeString()
    result = result.replace(/<localeTime>/ig, localeDateString)
    result = result.replace(/<time>/ig, isoDate)
    result = result.replace(/<date>/ig, dateString)
    result = result.replace(/<dateTime>/ig, timeString)

    // Return the formatted link
    return result
}

async function convert_escape_characters(string) {
  // replacing double quotes so they are escaped for JSON.parse
  let result = string.replace(/["]/g, "\\\"")
  // convert escape characters like \t to tabs
  result = JSON.parse("\"" + result + "\"")
  return result
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
//  Handle incoming link (be it by button, be it by script)
//

async function handle_incoming_link(incoming_link) {

    console.log(incoming_link)

    let open_mode = 'three_pane'
    let config = await browser.storage.local.get('cb_thunderlink')
    if (config.cb_thunderlink) {
        open_mode = config.cb_thunderlink.open_mode
    }

    let match = /((cb)?thunderlink):\/\/([^\s\]]+)/.exec(incoming_link)
    let link_type = match[1]
    let link = match[3]

    if (link_type == 'cbthunderlink') {
        let decoded_link = atob(link)
        let date_auth = decoded_link.split(";")
        let the_date = new Date(date_auth[0])
        let the_author = date_auth[1]
        let the_query = {
            author   : the_author,
            fromDate : the_date,
            toDate   : the_date
        }
        let ml = await messenger.messages.query(the_query)
        let the_message = ml.messages[0]
        messenger.cb_api.cb_show_message_from_api_id(the_message.id, open_mode)
    }

    if (link_type == 'thunderlink') {
        msg_id =  link.replace('messageid=', '')
        messenger.cb_api.cb_show_message_from_msg_id(msg_id, open_mode)
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
    cb_goto(encoded_link)
})

// vim: syntax=javascript ts=4 sw=4 sts=4 sr et columns=100
