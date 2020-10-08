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

const inputs = document.getElementsByTagName('input')

//
// GUI => local storage
//

function store_settings() {
    let conf_links = {}
    for (input of inputs) {
        if (!input.id.startsWith('s_')) continue
        let idx = input.id.replace(/^s_[^\d]*/, '')
        if (!conf_links[idx]) {
            conf_links[idx] = {}
        }
        if (input.id.startsWith('s_enable')) {
            conf_links[idx].enable = input.checked
        } 
        if (input.id.startsWith('s_name')) {
            conf_links[idx].name = input.value
        } 
        if (input.id.startsWith('s_value')) {
            conf_links[idx].value = input.value
        } 
    }
    let settings = {
        open_mode: document.querySelector('input[name="open_mode"]:checked').value,
        conf_links: conf_links
    }
    browser.storage.local.set({cb_thunderlink: settings})
}

//
// EventListener on each input to store settings.
//

for (input of inputs) {
    input.addEventListener('change', store_settings)
}

//
// local storage => GUI (at opening settings)
//

browser.storage.local.get().then((settings) => {
    if (settings.cb_thunderlink) {
        let open_mode = settings.cb_thunderlink.open_mode
        document.getElementById(open_mode).checked = true
        let conf_links = settings.cb_thunderlink.conf_links
        for (const key in conf_links) {
            let conf_link = conf_links[key]
            document.getElementById('s_enable_' + key).checked = conf_link.enable
            document.getElementById('s_name_' + key).value = conf_link.name
            document.getElementById('s_value_' + key).value = conf_link.value
        }
    }
})

// vim: syntax=javascript ts=4 sw=4 sts=4 sr et columns=120
