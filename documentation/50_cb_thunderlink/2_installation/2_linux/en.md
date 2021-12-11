type            : "page"
title           : "cb_thunderlink installation under Linux"
menutitle       : "Linux"
slug            : "cb_thunderlink/installation/linux"
date            : "2020-11-26 00:00:00"

visible         : true
comment         : true

grep            : true
align           : "Justify"

===

(Currently only tested for XUbuntu 18.04, all feedback on other systems welcome!)

Head again to  the [latest release](https://github.com/CamielBouchier/cb_thunderlink/releases) and download the `cb_thunderlink_linux.zip` from the assets.

Unzip the `cb_thunderlink_linux.zip` e.g. to `~/cb_thunderlink`.
This location must be a fixed location (no network location!) and permanently available.

Open a `shell` and issue :

```
> cd ~/cb_thunderlink
> ./cb_thunderlink register
``` 

It registers the executable to the add-on and it registers the protocols `thunderlink://` and `cbthunderlink://` to the operating system.

Remove and reinstall the `cb_thunderlink.xpi` into Thunderbird and that's it. 
From now on you should have again clickable `(cb)thunderlink`'s!

<!--
vim: ts=4 sw=4 sts=4 sr et columns=160
-->
