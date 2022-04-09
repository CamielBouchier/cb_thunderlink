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
    avoid_folders = document.getElementById('avoid_folders').value.split(',')
    for (let i=0; i<avoid_folders.length; i++) {
        avoid_folders[i] = avoid_folders[i].trim()
    }
    prefer_folders = document.getElementById('prefer_folders').value.split(',')
    for (let i=0; i<prefer_folders.length; i++) {
        prefer_folders[i] = prefer_folders[i].trim()
    }
    let settings = {
        open_mode           : document.querySelector('input[name="open_mode"]:checked').value,
        now_strftime_format : document.getElementById('now_strftime_format').value.trim(),
        conf_links          : conf_links,
        avoid_folders       : avoid_folders,
        prefer_folders      : prefer_folders,
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

browser.storage.local.get('cb_thunderlink').then((settings) => {
    if (settings.cb_thunderlink) {
        let open_mode           = settings.cb_thunderlink.open_mode
        let now_strftime_format = settings.cb_thunderlink.now_strftime_format
        let avoid_folders       = settings.cb_thunderlink.avoid_folders
        let prefer_folders      = settings.cb_thunderlink.prefer_folders
        let conf_links          = settings.cb_thunderlink.conf_links
        document.getElementById(open_mode).checked = true
        document.getElementById('now_strftime_format').value = now_strftime_format
        document.getElementById('avoid_folders').value = avoid_folders.join(', ')
        document.getElementById('prefer_folders').value = prefer_folders.join(', ')
        for (const key in conf_links) {
            let conf_link = conf_links[key]
            document.getElementById('s_enable_' + key).checked = conf_link.enable
            document.getElementById('s_name_' + key).value = conf_link.name
            document.getElementById('s_value_' + key).value = conf_link.value
        }
    }
})

// vim: syntax=javascript ts=4 sw=4 sts=4 sr et columns=120
