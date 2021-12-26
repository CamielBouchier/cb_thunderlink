# -*- mode: python ; coding: utf-8 -*-
# vim: syntax=python ts=4 sw=4 sts=4 sr et columns=100 lines=45

#
# $BeginLicense$
#
# (C) 2020-2021 by Camiel Bouchier (camiel@bouchier.be)
#
# This file is part of cb_thunderlink.
#
# License: Mozilla Public License Version 2.0
# (https://github.com/CamielBouchier/cb_thunderlink/blob/main/LICENSE)
#
# $EndLicense$
#

#
# u option for unbuffered stdio. Needed (cf. python -u in the *.bat file approach)
#

options = [('u', None, 'OPTION')]

#####

block_cipher = None

#####

a = Analysis(
    ['cb_thunderlink.py'],
    binaries=[],
    datas=[
        ('cb_thunderlink.json', '.'),
        ('mail_extension/cb_thunderlink.xpi', '.'),
        # Those solve at once our source distribution obligations.
        ('cb_thunderlink.*', 'src'),
        ('mail_extension/*.*', 'src/mail_extension'),
        ('mail_extension/images/*.*', 'src/mail_extension/images'),
    ],
    hiddenimports=[],
    hookspath=[],
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False
)

#####

pyz = PYZ(
    a.pure,
    a.zipped_data,
    cipher=block_cipher
)

#####

exe = EXE(
    pyz,
    a.scripts,
    options,
    [],
    exclude_binaries=True,
    name='cb_thunderlink',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True
)

#####

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='cb_thunderlink'
)

#####
