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

console.log("cb_api started")

var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm")
var { Services }        = ChromeUtils.import("resource://gre/modules/Services.jsm")
var { MailUtils }       = ChromeUtils.import("resource:///modules/MailUtils.jsm")
try {
    var { Gloda }       = ChromeUtils.import("resource:///modules/gloda/GlodaPublic.jsm")
} catch(e) {
    try {
        var { Gloda }   = ChromeUtils.import("resource:///modules/gloda/public.js")
    } catch (e) {
        console.log(e)
    }
}

// Somewhere around version 115 it seems NOUN_MESSAGE moved into GlodaConstants instead of GlodaPublic
try {
    var { GlodaConstants } = ChromeUtils.import("resource:///modules/gloda/GlodaConstants.jsm")
    var CB_NOUN_MESSAGE = GlodaConstants.NOUN_MESSAGE
} catch(e) {
    var CB_NOUN_MESSAGE = Gloda.NOUN_MESSAGE
}

//
// Implementation of an experimental API.
// - cb_show_message_from_api_id(api_id, open_mode) will 'goto' the message identified by api_id.
//   open_mode : three_pane | new_window | new_tab
// - cb_show_message_from_msg_id(msg_id, open_mode) will 'goto' the message identified by msg_id.
//   open_mode : three_pane | new_window | new_tab
//

var cb_api = class extends ExtensionCommon.ExtensionAPI {
    getAPI(context) {
        return {
            cb_api: {
                cb_show_message_from_api_id(api_id, open_mode) {
                    console.log("cb_show_message_from_api_id", api_id, open_mode)
                    // See : https://thunderbird-webextensions.readthedocs.io/en/latest/how-to/experiments.html
                    // #using-folder-and-message-types
                    let the_message = context.extension.messageManager.get(api_id)
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
                },
                cb_show_message_from_msg_id(msg_id, open_mode, prefer_folders, avoid_folders) {
                    console.log("cb_show_message_from_msg_id", msg_id, open_mode, prefer_folders, avoid_folders)
                    let query = Gloda.newQuery(CB_NOUN_MESSAGE)
		            query.headerMessageID(msg_id)
                    query.getCollection({
                        onItemsAdded : function () {},
                        onItemsModified : function () {},
                        onItemsRemoved : function () {},
                        onQueryCompleted: function (collection) {
                            let the_messages = []
                            for (let i=0; i<collection.items.length; i++) {
                                let item = collection.items[i]
                                if (item.folderMessage) {
                                    the_messages.push(item.folderMessage)
                                }
                            }
                            let the_message = null
                            for (let idx in the_messages) {
                                let folder = the_messages[idx].folder
                                if (prefer_folders.includes(folder.name)) {
                                    the_message = the_messages[idx]
                                    break
                                }
                            }
                            if (!the_message) {
                                for (let idx in the_messages) {
                                    let folder = the_messages[idx].folder
                                    if (!avoid_folders.includes(folder.name)) {
                                        the_message = the_messages[idx]
                                        break
                                    }
                                }
                            }
                            if (!the_message && the_messages.length) {
                                the_message = the_messages[0]
                            }
                            if (!the_message) {
                                console.error("Investigate me. the_message == null. collection:", collection)
                                return
                            }
                            // Following few lines are +/- from original thunderlink.
                            // Code deduplication proved difficult, e.g. for callback.
                            let win = Services.wm.getMostRecentWindow("mail:3pane")
                            if (open_mode == "new_window") {
                                 MailUtils.openMessagesInNewWindows([the_message])
                            } else if (open_mode == "new_tab") {
		                         MailUtils.displayMessage(the_message)
                            } else {
                                if (open_mode != "three_pane") {
                                    console.error("open_mode should new_window|new_tab|three_pane:", open_mode)
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
                    })
                }
            }
        }
    }
}

// vim: syntax=javascript ts=4 sw=4 sts=4 sr et columns=120
