<b>cb_thunderlink - clickable, durable links to specific messages</b>
===

### Intro - Thanks

I am a long time user of [thunderlink](https://addons.thunderbird.net/nl/thunderbird/addon/thunderlink/) ([github](https://github.com/mikehardy/thunderlink)). I can't imagine my workflow and electronic archive without!

However Thunderbird changed quite drastically the underlying APIs and thefore thunderlink stopped working on recent versions. See e.g. [this announcement](https://www.thunderbird.net/en-US/thunderbird/78.0/releasenotes/)

A complete re-think and re-write was needed and the original author did not have the time. So I took the task doing so.

Big thanks to [Mike Hardy](https://github.com/mikehardy) and team for having thunderlink supported all this time!

### Important remark on cb_thunderlink vs thunderlink

#### 'thunderlink://' versus 'cbthunderlink://'

The original thunderlink identified messages in an unique way by using message-id of the email. Links would read like `thunderlink://messageid=somestuff@foobar`. cb_thunderlink still fully supports this.

However, there is a remote risk that searching on the message-id gets lost in the further future reduction of thunderbird API. Therefore a second mechanism was introduced named 'cbthunderlink'. This identifies messages in an unique way using the message-date and message-author. Links would read like `cbthunderlink://SomeBase64String`. It might be slightly more future-proof to start using those.

Features work for both and where needed I will distinguish them as `cbthunderlink`, `thunderlink` or `(cb)thunderlink` when referring to both.

#### Clickable - OS-integration

Thunderlinks clickable-feature depended on being able calling the `thunderbird -thunderlink xyz` command. However thunderbird has also dropped support therefore... 

To keep that feature available, cb_thunderlink comes with an accompanying program, started automatically by the add-on, to emulate that feature and make links clickable again. Note that currently this is only available yet for Windows.

However, cb_thunderlink can be used perfectly well without that accompanying program as well. Links need to be cut then from your source and paste (using the cbthunderlink button) into thunderbird.


### Description - usage

`(cb)thunderlink`'`s are durable hyperlinks to specific email messages.

You can use them anywhere you want immediate access to the original message contents in full. 
For example, wikis, task trackers, etc.

Click on `(cb)thunderlink` later to open that specific message in Thunderbird.
(when not installing the accompanying program, copy the link and paste it using cb_thunderlink button)

You may customize `(cb)thunderlink` formats to fit your needs.

`(cb)thunderlinks` are durable even if you file the message. This enables the Thunderbird email client to quickly and reliably find and select any email that exists in your Thunderbird mail store.

<b>Installation</b>
===========
<ol>
<li>Install the ThunderLink Add-On in Thunderbird - https://addons.thunderbird.net/en-US/thunderbird/addon/thunderlink/?src=search</li>
<li>Register the 'thunderlink' protocol in your OS following the instructions below:</li>
</ol>
 </b>

   <b>Windows:</b>
   ----------------
   Download the "raw" version of the file that matches your Windows and Thunderbird versions, then double-click the file and confirm the registry script to merge it in to your registry:
   
   <ul>
   <li>https://github.com/mikehardy/thunderlink/blob/master/integration/ThunderLink_WINXP_WIN7_32bit_Thunderbird_32bit.reg
   <li>https://github.com/mikehardy/thunderlink/blob/master/integration/ThunderLink_WIN7_64bit_Thunderbird_32bit.reg
   <li>https://github.com/mikehardy/thunderlink/blob/master/integration/ThunderLink_WIN10_64bit_Thunderbird_32bit.reg
   </ul>

   These .reg files were generously provided by @mobileartur - please feel free to provide others or open pull requests to help other windows users. Note that 32bit Thunderbird is the current recommendation for Windows. For this reason we don't have registry files for 64-bit Thunderbird.

Linux (Tested on Ubuntu 18.04LTS):
----------------------------------

1. Get an example Thunderlink and test it directly.

   Right-click an email and choose "ThunderLink..." > "thunderlink". This will save it to the clipboard. It should look something like this:

       thunderlink://messageid=123456.789012@example.com

   Next, test the thunderlink URL directly from the command line like this:

       $ thunderbird -thunderlink 'thunderlink://messageid=123456.789012@example.com'

   If nothing happens, the addon is either not installed or not functioning. If the message ID is wrong, this will result in an error pop-up that says "Couldn't find an email message for ThunderLink". If it works, it will open the corresponding message. Proceed to the next step to start registering the `thunderlink://` URL scheme.

2. Check if the `thunderlink://` protocol is already registered:

       $ gio mime x-scheme-handler/thunderlink
       No default applications for “x-scheme-handler/thunderlink”

   If you don't have `gio`, use `xdg-mime` instead:

       $ xdg-mime query default x-scheme-handler/thunderlink
       $ echo $?
       4

   Blank output and a non-zero error code from `xdg-mime` mean it's not registered.

3. Install the desktop file.

   - Manually:
      - Download the thunderlink launcher from  <https://github.com/mikehardy/thunderlink/blob/master/integration/thunderbird-tl.desktop>
      - Copy it to `~/.local/share/applications/thunderbird-tl.desktop`

   - Command line:
     - `wget -P ~/.local/share/applications/ https://raw.githubusercontent.com/mikehardy/thunderlink/master/integration/thunderbird-tl.desktop`

   These are the important lines in the desktop file:

       Exec=thunderbird -thunderlink %u
       MimeType=x-scheme-handler/thunderlink

4. Make the desktop file executable.

       $ chmod +x $HOME/.local/share/applications/thunderbird-tl.desktop

   This is necessary [because of security precautions](https://askubuntu.com/questions/419610/permission-of-a-desktop-file)

5. Register the `x-scheme-handler/thunderlink` mimetype to the desktop file.

   Using `gio`:

       $ gio mime x-scheme-handler/thunderlink thunderbird-tl.desktop
       Set thunderbird-tl.desktop as the default for x-scheme-handler/thunderlink

   Using `xdg-mime`:

       $ XDG_UTILS_DEBUG_LEVEL=2 xdg-mime default 'thunderbird-tl.desktop' 'x-scheme-handler/thunderlink'

   On most Linux distributions, these commands add this line:

       x-scheme-handler/thunderlink=thunderbird-tl.desktop

   to the configuration file `~/.config/mimeapps.list` under the `[Added Associations]` section.

6. Check if it was successfully registered:

       $ gio mime x-scheme-handler/thunderlink
       Default application for “x-scheme-handler/thunderlink”: thunderbird-tl.desktop
       Registered applications:
           thunderbird-tl.desktop
       Recommended applications:
           thunderbird-tl.desktop

   If you don't have `gio`, use `xdg-mime` instead:

       $ xdg-mime query default x-scheme-handler/thunderlink
       thunderbird-tl.desktop
       $ echo $?
       0

7. Try opening a thunderlink directly with Thunderbird again:

        $ thunderbird -thunderlink 'thunderlink://messageid=123456.789012@example.com'

    and then with `xdg-open` to test the desktop file:

        $ xdg-open 'thunderlink://messageid=123456.789012@example.com'

   If the `xdg-open` command succeeds, then Thunderlink is installed properly.

8. If `xdg-open` works but some applications do not, they may be using older configuration files.

   For example, some applications use the old location for `mimeapps.list` instead of
`~/.config/`. To fix this, edit this file with a text editor:

       $ edit ~/.local/share/applications/mimeapps.list

   and manually add this line:

       x-scheme-handler/thunderlink=thunderbird-tl.desktop

   under the "\[Default Applications\]" group. (This location is listed as "[for compatibility, deprecated](https://standards.freedesktop.org/mime-apps-spec/1.0.1/ar01s02.html)" by the FreeDesktop standard.)

   Some applications read `mimeinfo.cache` instead of `mimeapps.list`, so regenerate the cache with `update-desktop-database`.

        $ update-desktop-database ~/.local/share/applications

   Note that this will not read the file at `~/.config/mimeapps.list`, it will read the file at `~/.local/share/applications/mimeapps.list`.

   There is also an [even older deprecated file](https://lists.freedesktop.org/archives/xdg/2014-February/013177.html) called `defaults.list` that is still used by some applications. Handle this in the same way; edit this file with a text editor:

       $ edit ~/.local/share/applications/defaults.list

   and manually add this line:

       x-scheme-handler/thunderlink=thunderbird-tl.desktop

   under the "\[Default Applications\]" group.

   <b>Mac:</b>
   ----------
   You may integrate directly with thunderbird using helper scripts as described here:
   https://github.com/mikehardy/thunderlink/blob/master/integration/macosx/install.txt
   
   Separately, it is possible to interoperate with Mail.app on macOS and Thunderbird on (for example) Windows with the same links, following these instructions: https://github.com/mikehardy/thunderlink/wiki/macOS-compatibility---interoperability
   
   <b>Usage</b>
   -------------
   Use the keyboard shortcut for the ThunderLink format you want (e.g. Ctrl-Alt-6) or right-click on an email and select 'ThunderLink...' and the format you want. You now have the ThunderLink to your email in your clipboard. You can paste it into your personal wiki, or your project teams wiki, or a new task entry in your task tracker for instance.

   If you would like a clickable ThunderLink with the email's subject, use a pattern like this: `<A HREF="<thunderlink>"><subject></a>` - this may be pasted into other systems that render HTML.

   If you registered the ThunderLink protocol correctly, a click on the ThunderLink will open your email directly using the ThunderLink options you configured (open in a new tab, open in a new window, etc)

   
   <b>Notes:</b>
   =======
   <ul>
   <li>Some task managers (for example, MyLifeOrganized (MLO)) require you to prefix the ThunderLink with `file:` to be treated like a link</li>
   <li>You can configure very complicated ThunderLinks if you like. For example:
   ```
   Email: <subject>   -s Tomorrow -*   @ Work;Email; 
   file:<thunderlink>
   ```
   </li>
   </ul>

   <b>Having trouble?</b>
   ================
   In the unlikely event of a bug, please open an issue on the provided github link, taking care to include all the requested information.

   Care to contribute? https://github.com/mikehardy/thunderlink

   For devs cloning the repo use make 'makeXpi.sh <release-number>' to create distributables for Thunderbird


<!--
vim: syntax=markdown ts=4 sw=4 sts=4 sr et columns=100
-->
