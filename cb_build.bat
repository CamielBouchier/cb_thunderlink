@ECHO OFF

REM
REM $BeginLicense$
REM
REM (C) 2020 by Camiel Bouchier (camiel@bouchier.be)
REM
REM This file is part of cb_thunderlink.
REM All rights reserved.
REM
REM $EndLicense$
REM
REM *****
REM
REM This bat file builds the cb_thunderlink distribution.
REM

cd mail_extension
"c:\Program Files\7-Zip\7z.exe" a cb_thunderlink.xpi @files_in_xpi.lst
cd ..
pyinstaller --noconfirm cb_thunderlink.spec
cd dist
"c:\Program Files\7-Zip\7z.exe" a cb_thunderlink.zip cb_thunderlink
cd ..

REM
REM vim: ts=4 sw=4 sts=4 sr et columns=100
REM
