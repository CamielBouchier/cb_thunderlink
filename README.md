"<b>Clickable, durable links to specific messages</b>"

### Intro - Thanks

I am a long time user of **thunderlink** as can be found on 
[addons.thunderbird.net](https://addons.thunderbird.net/nl/thunderbird/addon/thunderlink/) or [github](https://github.com/mikehardy/thunderlink). I can't imagine my workflow and electronic archive without!

However Thunderbird changed quite drastically the underlying APIs and thefore thunderlink stopped working on recent versions. See e.g. [this announcement.](https://www.thunderbird.net/en-US/thunderbird/78.0/releasenotes/)
A complete re-think and re-write was needed and the original author did not have the time. So I took the task doing so.

Big thanks to [Mike Hardy](https://github.com/mikehardy) and team for having thunderlink supported all this time!

### Important remarks on cb_thunderlink vs thunderlink

#### `thunderlink://` versus `cbthunderlink://`

The original thunderlink identified messages in an unique way by using message-id of the email. Links would read like `thunderlink://messageid=somestuff@foobar`. cb_thunderlink still fully supports this.

However, there is a remote risk that searching on the message-id gets lost in the further future reduction of Thunderbird API. Therefore a second mechanism was introduced named 'cbthunderlink'. This identifies messages in an unique way using the message-date and message-author. Links would read like `cbthunderlink://SomeBase64String`. It might be slightly more future-proof to start using those.

Features work for both and where needed I will distinguish them as `cbthunderlink`, `thunderlink` or `(cb)thunderlink` when referring to both.

#### Clickable - OS-integration

Thunderlinks clickable-feature depended on being able calling the `thunderbird -thunderlink xyz` command. However Thunderbird has also dropped support therefore... 

To keep that feature available, cb_thunderlink comes with an accompanying program, started automatically by the add-on, to emulate that feature and make links clickable again. Note that currently this is only available yet for Windows and for some Linuxes.

However, cb_thunderlink can be used perfectly well without that accompanying program. Links need to be cut then from your source and pasted (using the cb_thunderlink button) into Thunderbird.


### Description - usage

`(cb)thunderlink`'s are durable hyperlinks to specific email messages.

You can use them anywhere you want immediate access to the original message contents in full. 
For example, wikis, task trackers, etc.

Click on `(cb)thunderlink` later to open that specific message in Thunderbird.
(when not installing the accompanying program, copy the link and paste it using cb_thunderlink button)

You may customize `(cb)thunderlink` formats to fit your needs.

`(cb)thunderlink`'s are durable even if you file the message. This enables the Thunderbird email client to quickly and reliably find and select any email that exists in your Thunderbird mail store.

### Installation

Head to the [latest release](https://github.com/CamielBouchier/cb_thunderlink/releases) and download the `cb_thunderlink.xpi` from the assets. You can install the `cb_thunderlink.xpi` in Thunderbird using the 'install add-on from file' feature in Thunderbird.

When not using the OS-integration and the 'clickable' feature, that is all you need. 
You can start using `(cb)thunderlink`'s with the approach of copying the links and pasting it using the cb_thunderlink button.

If you need the full power of OS integration and the possibility to click links, read further. The instructions will be different per OS and currently only Windows is supported.

#### Windows

Head again to  the [latest release](https://github.com/CamielBouchier/cb_thunderlink/releases) and download the `cb_thunderlink_windows.zip` from the assets.

Unzip the `cb_thunderlink_windows.zip` e.g. to `C:\FooBar\cb_thunderlink`.

Open a 'Command prompt' **as administrator** and issue :

```
> cd C:\FooBar\cb_thunderlink
> cb_thunderlink.exe register
``` 

It registers the executable to the add-on and it registers the protocols `thunderlink://` and `cbthunderlink://` to the operating system.

Remove and reinstall the `cb_thunderlink.xpi` into Thunderbird and that's it. 
From now on you should have again clickable `(cb)thunderink`'s!

#### Linux

(Currently only tested for XUbuntu 18.04, all feedback on other systems welcome!)

Head again to  the [latest release](https://github.com/CamielBouchier/cb_thunderlink/releases) and download the `cb_thunderlink_linux.zip` from the assets.

Unzip the `cb_thunderlink_linux.zip` e.g. to `~/cb_thunderlink`.

Open a 'shell' and issue :

```
> cd ~/cb_thunderlink
> ./cb_thunderlink register
``` 

It registers the executable to the add-on and it registers the protocols `thunderlink://` and `cbthunderlink://` to the operating system.

Remove and reinstall the `cb_thunderlink.xpi` into Thunderbird and that's it. 
From now on you should have again clickable `(cb)thunderink`'s!

#### MAC

Currently unsupported for OS-integration and clickable.

<!--
vim: syntax=markdown ts=4 sw=4 sts=4 sr et columns=100
-->
