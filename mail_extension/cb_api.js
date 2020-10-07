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

console.log("cb_api started")

var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm")
var { Services }        = ChromeUtils.import("resource://gre/modules/Services.jsm")
var { MailUtils }       = ChromeUtils.import("resource:///modules/MailUtils.jsm")

//
// Implementation of an experimental API.
// - cb_show_message(message_id, open_mode) will 'goto' the message identified by message_id.
//   (message_id as in the webextensions API!) open_mode : three_pane | new_window | new_tab
//

var cb_api = class extends ExtensionCommon.ExtensionAPI {
    getAPI(context) {
        return {
            cb_api: {
                cb_show_message(message_id, open_mode) {
                    console.log("cb_show_message", message_id, open_mode)
                    // See : https://thunderbird-webextensions.readthedocs.io/en/latest/how-to/experiments.html
                    // #using-folder-and-message-types
                    let the_message = context.extension.messageManager.get(message_id)
                    // Following few lines are +/- from original thunderlink.
                    let win = Services.wm.getMostRecentWindow("mail:3pane")
                    if (open_mode == "new_window") {
                        MailUtils.openMessagesInNewWindows([the_message])
                    } else if (open_mode == "new_tab") {
		                MailUtils.displayMessage(the_message)
                    } else {
                        if (open_mode != "three_pane") {
                            console.error("open_mode should be one of new_window|new_tab|three_pane:", open_mode)
                        }
		                if (win) {
                            let tabmail = win.document.getElementById("tabmail")
                            tabmail.switchToTab(0) //will always be the mail tab
                            win.focus()
		                    win.gFolderTreeView.selectFolder(the_message.folder)
		                    win.gFolderDisplay.selectMessage(the_message)
                        } else {
		                    MailUtils.displayMessage(the_message)
		                }
		            }
                }
            }
        }
    }
}

// vim: syntax=javascript ts=4 sw=4 sts=4 sr et columns=120
