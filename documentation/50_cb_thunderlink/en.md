type            : "page"
title           : "cb_thunderlink"
slug            : "cb_thunderlink"
date            : "2020-10-10 21:00:00"

visible         : true
comment         : true
opencomment     : true

grep            : true
thumbnail       : "thumbnail_1200x800.jpg"
thumbnailtitle  : "Photo by JJ Ying (https://unsplash.com/@jjying)"
align           : "Justify"

===

#### Intro - Thanks

I am a long time user of **thunderlink** as can be found on 
[addons.thunderbird.net](https://addons.thunderbird.net/nl/thunderbird/addon/thunderlink/) or [github](https://github.com/mikehardy/thunderlink). 
I can't imagine my workflow and electronic archive without!

It's functionality is as simple as useful : click (or paste) a link from your personal wiki into thunderbird and it opens the associated message.

However Thunderbird changed quite drastically the underlying APIs and thefore thunderlink stopped working on recent versions. 
See e.g. [this announcement.](https://www.thunderbird.net/en-US/thunderbird/78.0/releasenotes/)
A complete re-think and re-write was needed and the original author did not have the time. So I took the task doing so.

Big thanks to [Mike Hardy](https://github.com/mikehardy) and team for having thunderlink supported all this time!

#### Important remarks on cb_thunderlink vs thunderlink

##### `thunderlink://` versus `cbthunderlink://`

The original thunderlink identified messages in an unique way by using message-id of the email. Links would read like `thunderlink://messageid=somestuff@foobar`. cb_thunderlink still fully supports this.

However, there is a remote risk that searching on the message-id gets lost in the further future reduction of Thunderbird API. Therefore a second mechanism was introduced named `cbthunderlink`. This identifies messages in an unique way using the message-date and message-author. Links would read like `cbthunderlink://SomeBase64String`. It might be slightly more future-proof to start using those.

Features work for both and where needed I will distinguish them as `cbthunderlink`, `thunderlink` or `(cb)thunderlink` when referring to both.

##### Clickable - OS-integration

Thunderlinks clickable-feature depended on being able calling the `thunderbird -thunderlink xyz` command. However Thunderbird has also dropped support therefore... 

To keep that feature available, cb_thunderlink comes with an accompanying program, started automatically by the add-on, to emulate that feature and make links clickable again. Note that currently this is only available yet for Windows and for some Linuxes.

However, cb_thunderlink can be used perfectly well without that accompanying program. Links need to be cut then from your source and pasted (using the cb_thunderlink button) into Thunderbird.


#### Description - usage

`(cb)thunderlink`'s are durable hyperlinks to specific email messages.

You can use them anywhere you want immediate access to the original message contents in full. 
For example, wikis, task trackers, etc.

Click on `(cb)thunderlink` later to open that specific message in Thunderbird.
(when not installing the accompanying program, copy the link and paste it using cb_thunderlink button)

You may customize `(cb)thunderlink` formats to fit your needs.

`(cb)thunderlink`'s are durable even if you file the message. This enables the Thunderbird email client to quickly and reliably find and select any email that exists in your Thunderbird mail store.

<!--
vim: syntax=markdown ts=4 sw=4 sts=4 sr et columns=160
-->
