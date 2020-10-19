#
# $BeginLicense$
#
# (C) 2020 by Camiel Bouchier (camiel@bouchier.be)
#
# This file is part of cb_thunderlink.
# All rights reserved.
#
# $EndLicense$
#
# *****
#
# This bat file builds the cb_thunderlink distribution.
#

rm -rf build_linux
rm -rf dist_linux
cd mail_extension
7z a cb_thunderlink.xpi @files_in_xpi.lst
cd ..
pyinstaller --noconfirm --workpath build_linux --distpath dist_linux cb_thunderlink.spec
cd dist_linux
7z a cb_thunderlink_linux.zip cb_thunderlink
cd ..

#
# vim: ts=4 sw=4 sts=4 sr et columns=100
#
