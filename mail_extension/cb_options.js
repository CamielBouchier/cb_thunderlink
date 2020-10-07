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

const prefixInput = document.querySelector("#prefix");
const suffixInput = document.querySelector("#suffix");
const copyBracketsInput = document.querySelector("#copyBrackets");
const urlEncodeInput = document.querySelector("#urlEncode");
const rawInput = document.querySelector("#raw");

function store_settings() {
    console.log(document.querySelector('input[name="open_mode"]:checked').value)
    browser.storage.local.set({
        cb_thunderlink: {
            open_mode: document.querySelector('input[name="open_mode"]:checked').value
        }
    })
}

function storeSettings() {
  browser.storage.local.set({
    copyID: {
      prefix: prefixInput.value,
      suffix: suffixInput.value,
      copyBrackets: copyBrackets.checked,
      urlEncode: urlEncode.checked,
      raw: raw.checked
    }
  });
}

/*
Update the options UI with the settings values retrieved from storage,
or the default settings if the stored settings are empty.
*/
function updateUI(storedSettings) {
  if (storedSettings.copyID) {
    prefixInput.value = storedSettings.copyID.prefix;
    suffixInput.value = storedSettings.copyID.suffix;
    copyBracketsInput.checked = storedSettings.copyID.copyBrackets;
    urlEncodeInput.checked = storedSettings.copyID.urlEncode;
    rawInput.checked = storedSettings.copyID.raw;
  }
}


/*
On opening the options page, fetch stored settings and update the UI with them.
*/

browser.storage.local.get().then((settings) => {
    if (settings.cb_thunderlink) {
        let open_mode = settings.cb_thunderlink.open_mode
        document.getElementById(open_mode).checked = true
    }
})

/*
On checkbox change, save the currently selected settings.
*/
copyBracketsInput.addEventListener("change", storeSettings);
urlEncodeInput.addEventListener("change", storeSettings);
rawInput.addEventListener("change", storeSettings);

/*
On textbox blur, save the currently selected settings.
*/
prefixInput.addEventListener("blur", storeSettings);
suffixInput.addEventListener("blur", storeSettings);

document.querySelector("#three_pane").addEventListener('change', store_settings)
document.querySelector("#new_tab")   .addEventListener('change', store_settings)
document.querySelector("#new_window").addEventListener('change', store_settings)

// vim: syntax=javascript ts=4 sw=4 sts=4 sr et columns=120
