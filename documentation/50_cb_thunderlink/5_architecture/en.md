type            : "page"
title           : "cb_thunderlink architecture"
menutitle       : "Architecture"
slug            : "cb_thunderlink/architecture"
date            : "2020-11-27 00:00:00"


visible         : true
comment         : true
opencomment     : true

grep            : true
align           : "Justify"

===

#### Files in distribution


```
|   api-ms-win-core-console-l1-1-0.dll  |
|   :                                   |
|   libssl-1_1-x64.dll                  |
|   python37.dll                        |
|   ucrtbase.dll                        |
|   VCRUNTIME140.dll                    |
|   :                                   |
|   pyexpat.pyd                         |
|   select.pyd                          |
|   unicodedata.pyd                     |
|   _bz2.pyd                            | => (1)
|   _ctypes.pyd                         |
|   _hashlib.pyd                        |
|   _lzma.pyd                           |
|   _socket.pyd                         |
|   _ssl.pyd                            |
|                                       |
|   base_library.zip                    |
| 
|   cb_thunderlink.exe                  | => (2)
|   cb_thunderlink.exe.manifest         |    
|
|   cb_thunderlink.json                 | => (3)
|
|   cb_thunderlink.xpi                  | => (4)
|   
+---logs
|       cb_thunderlink.log
|       
\---src                                 | => (5)
    |   cb_thunderlink.json              
    |   cb_thunderlink.py               | => (6)
    |   cb_thunderlink.spec             | => (7)
    |   
    \---mail_extension                  | => (8)
        |   cb_api.js                   |
        |   cb_api_schema.json          |
        |   cb_background.js            |
        |   cb_options.css              |
        |   cb_options.html             |
        |   cb_options.js               |
        |   files_in_xpi.lst            |
        |   manifest.json               |
        |
        |   cb_thunderlink.xpi          | => (9)
        |   
        \---images            
                cb-128px.png
                cb-16px.png
                cb-256px.png
                cb-32px.png
                cb-48px.png
                cb-64px.png
```

1.  All files that implement and support the Python interpreter that 'pyinstaller' packaged into `cb_thunderlink.exe`.
1.  The Python script `cb_thunderlink.py` (see 'src') packaged along with the appropriate Python interpreter.
1.  Used under Linux for describing the 'native messaging' interface.
1.  `cb_thunderlink.xpi` is the Thunderbird add-on.
1.  The 'src' is unused but delivered as documentation.
1.  `cb_thunderlink.py` is the main and only script for os-integration.
1.  Configuration script for 'pyinstaller'.
1.  The Thunderbird add-on sources.
1.  `cb_thunderlink.xpi` is the Thunderbird add-on, basically a zip of the sources above.

#### Drawing

<p>
    <img src="{{slug}}/arch.jpg" alt="arch" align="left" title="Drawing by Camiel Bouchier" width="100%">
</p>

#### Explanation

##### Main function

The main functionality is obtained by loading `cb_thunderlink.xpi` as a thunderbird add-on. It runs in the OS 'Process 1'.

Through the context-menu on the message-list, or a shortcut, a `(cb)thunderlink` is generated and stored in the OS clipboard.

The `cb_thunderlink`-button takes the link that is in the OS clipboard and lets thunderbird navigate to the linked message.

Actually, one can run run perfectly cb_thunderlink this way : copying around `(cb)thunderlink`'s and paste it using the `cb_thunderlink`-button

#### OS-integration

The OS-integration is about the capability to click a `(cb)thunderlink` in a web-page, a wiki etc. and having thunderbird jumping to that message.

Earlier implementations could rely on the capability of thunderbird to be called as `thunderbird -thunderlink link`.
Recent versions of thunderbird do not support anymore. 
Moreover the capability of thunderbird to communicate with the external world is very restricted.
Hence a quite convoluted alternative approach was needed.

The first step is that `cb_thunderlink.xpi` ('Process 1') tries to start `cb_thunderlink.py` ('Process 2') through the only mechanism that
thunderbird allows, i.e. [native messaging.](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging)
This process does nothing else than listen on port 1302 for incoming commands and communicate it through to 'Process 1' where it will
be handled similar as pasting a `(cb)thunderlink`.

The other step is `cb_thunderlink.py (cb)thunderlink://...` is started as 'Process 3' passing the argument over port 1302 to 'Process 2'.
This allows to associate in the OS a link with an executable (equivalent to the earlier `thunderbird -thunderlink link`) that jumps to a message.

##### Register

As well the [native messaging](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging), as the linking
of `(cb)thunderlink://...` with 'Process 3' require OS specific setups. The `cb_thunderlink.py register` handles this part of the story.

In Windows all connections are fixed in the registry.
Under Linux it is a combination of setting up a json file on a specific location and setting up gio.

For more details, look into the source code of `cb_thunderlink.py` under the 'register' branch.

<!--
vim: syntax=markdown ts=4 sw=4 sts=4 sr et columns=160
-->
