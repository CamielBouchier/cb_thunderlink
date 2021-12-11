type            : "page"
title           : "cb_thunderlink malfunction checklist"
menutitle       : "Checklist"
slug            : "cb_thunderlink/checklist"
date            : "2020-11-27 00:00:00"

visible         : true
comment         : true

grep            : true
align           : "Justify"

===

If something does not work as anticipated, feel free to submit an [issue on github.](https://github.com/CamielBouchier/cb_thunderlink/issues)
However, before doing so, I would strongly suggest to run through the checklist hereafter. It probably will address your issue and if not it 
will provide me the info I need anyways to help you.


### Basic functionality

#### Did you install correctly?

See [installation instructions.](installation)

#### Does the basic functionality work?

* Select a message in the message-list, create a `thunderlink` using the context-menu.
* Select a different message and click the `cb_thunderlink` button. Does it revert to the message you created a link for?
* Repeat a few times for different messages.
* Do now the same cycle but create a `cbthunderlink` using the context-menu.
* Repeat a few times for different messages.

If all this works reliably, the basic functionality is OK and you are facing an [OS-integration](#os_integration) issue.
Otherwise continue :

#### Is global indexing enabled?

* Can you actually find the message through the 'search messages' option of thunderbird itself? Try locating it with author and date.
* One of the options of thunderbird is 'global indexing'. Go to the thunderbird generic options (location might be different with different versions)
and make sure the 'global indexing' checkbox is checked. If not, searching probably won't work at all.
* Restart thunderbird and try again.

#### Rebuild `global-messages-db.sqlite`

If above did not work :
* Close thunderbird, go to the profile directory and remove `global-messages-db.sqlite`
* Reopen thunderbird and wait until `global-messages-db.sqlite` is rebuild (i.e. you do not see changing it anymore). Depending on your setup that can take quite some time.
* Try again.

#### Check error console

If at this point it still not works, I will need to have some logging results.
 
* Open the error-console `Ctrl+Shift+J`.
* Do a cycle of generating a link and pasting it using the button as described earlier.
* Do you see any relevant output on the error console? Can you share?

Remark w.r.t. privacy: the `cbthunderlink://SomeHexString` is actually a 'base64-encoding' of the emails author and time of sending!

<a id="os_integration"></a>

### OS-integration

#### Are you on Linux and is thunderbird 'snap' based installed?

If so, the OS-integration won't work!  

[Native messaging](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging) is known not to work on 'snap' based thunderbirds.
Until somebody builds a proof of concept based on [this link about Native messaging](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging) there is nothing I can do.

Note however, it will and should work on a package (rpm, deb, ...) based installation of thunderbird.


#### Does the extension receive the link?

* Open the error-console `Ctrl+Shift+J`.
* Paste the failing link (`(cb)thunderlink://...`) manually using the `cb_thunderlink`-button.
* You should see in the error-console a message along the lines of `handle_incoming_link (cb)thunderlink://...`.
* Now try to do the same by clicking the link.
* If the OS-integration were working, you would see the same message now. But probably you don't?

If you would see that same message now nevertheless reach out to me. It is totally unexpected that the basic functionality works and this one not.

Keep the error-console open during the remainder of your investigation.

#### Run `cb_thunderlink (cb)thunderlink://...` manually

* Head to the directory where you installed cb_thunderlink. E.g. `C:\FooBar\cb_thunderlink` under Windows or `~/cb_thunderlink` under Linux.
* You will find there find a `logs` directory containing `cb_thunderlink.log`. You might want to inspect this for error messages or other anomalies.
* Run from a terminal at the installation directory: `cb_thunderlink (cb)thunderlink://your_link_with_issue`.
* Does that work? Do  you see an incoming message notification on the thunderbird error-console? Do you see anything in the `cb_thunderlink.log`?

If this does not work, please contact me with the information you obtained. It is unclear what is not working ...

If this does work, yet the clicking of a link does not work, something went wrong in associating in your OS a link with an executable. 
You are probably on Linux and we might want to review the specifics.


<!--
vim: ts=4 sw=4 sts=4 sr et columns=160
-->
