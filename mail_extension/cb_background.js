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
// Start our accompanying python script.
// See : https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging
//

var port = browser.runtime.connectNative("cb_thunderlink")

//
// The browserAction (button) we respond to queries for the currently displayed message.
// That one is converted to a link (based on date/author) we subsequently copy to the clipboard.
//

messenger.messageDisplayAction.onClicked.addListener(() => {
    let tab_query = {active: true, currentWindow: true}
    messenger.tabs.query(tab_query).then(tabs => {
        messenger.messageDisplay.getDisplayedMessage(tabs[0].id).then((message) => {
            let link = "cbthunderlink://" + btoa(message.date.toJSON() + ";" + message.author)
            console.log("cb_background generated link: " + link)
            navigator.clipboard.writeText(link)
        })
    })
})

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
