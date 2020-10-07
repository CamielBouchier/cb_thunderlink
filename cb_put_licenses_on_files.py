# -*- coding: utf-8 -*-
# vim: syntax=python ts=4 sw=4 sts=4 sr et columns=100 lines=45


"""

$BeginLicense$

(C) 2020 by Camiel Bouchier (camiel@bouchier.be)

This file is part of cb_thunderlink.
All rights reserved.

$EndLicense$

"""

####################################################################################################

# Want to be asap sure we are running Python 3.6
import sys
assert sys.version_info >= (3,6)

import logging
logger = logging.getLogger(__name__)

import datetime
import os
import re

####################################################################################################

program_name = "cbPutLicenseOnFiles"
log_dir      = "Logs"

license_txt = [
    '',
    '(C) 2020 by Camiel Bouchier (camiel@bouchier.be)',
    '',
    'This file is part of cb_thunderlink.',
    'All rights reserved.',
    ''
    ]

####################################################################################################

def generate_files(root, extensions_to_include=[], regexes_to_exclude=[]) :

    for path, dirs, files in os.walk(root) :
        for the_file in files :

            relative_name = os.path.join(path, the_file).replace('\\', '/')

            if extensions_to_include :
                (filename, extension) = os.path.splitext(the_file)
                if extension not in extensions_to_include :
                    continue

            # logger.info(f"including \'{relative_name}\'")

            excluded_due_to_regex = False
            for regex in regexes_to_exclude :
                if re.match(regex, relative_name) :
                    # logger.info(f"excluding \'{relative_name}\' due to \'{regex}\'")
                    excluded_due_to_regex = True
                    break
            if excluded_due_to_regex :
                continue

            yield os.path.abspath(relative_name).replace('\\', '/')

####################################################################################################

def handle_file(filename) :

    logger.info(f"Handling file {filename}")

    with open(filename, encoding="utf-8") as f :
        file_lines = f.readlines()

    has_begin_license = False
    has_end_license = False

    for line in file_lines :
        if not has_begin_license and re.match(r'.{0,5}\$BeginLicense\$', line) :
            has_begin_license = True
            begin_license_line = line
        if has_begin_license and re.match(r'.{0,5}\$EndLicense\$', line) :
            has_end_license = True
            end_license_line = line
            break

    if not has_begin_license :
        logger.info("No 'BeginLicense' found in '{}'".format(filename))
        return

    if has_begin_license and not has_end_license :
        logger.info("No 'EndLicense' found in '{}'".format(filename))
        return

    with open(filename, "w", encoding="utf-8") as f :
        skipping = False
        for line in file_lines :
            if not skipping :
                f.write(line.rstrip()+'\n') # Implicit trailing blanks removal.
            if line == end_license_line :
                f.write(line)
                skipping = False
            if line == begin_license_line :
                skipping = True
                for X in license_txt :
                    f.write(begin_license_line.replace('$BeginLicense$', X).rstrip()+'\n')

####################################################################################################

def install_logger() :

    now_string   = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    log_filename = "{}/{}_{}.log".format(log_dir, program_name, now_string)

    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)

    file_handler = logging.FileHandler(log_filename, mode='a', encoding="utf8")
    file_handler.setLevel(logging.DEBUG)
    file_format = "%(asctime)s - %(levelname)10s - %(filename)32s:%(lineno)5s : %(message)s"
    file_formatter = logging.Formatter(file_format)
    file_handler.setFormatter(file_formatter)

    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_format = "%(filename)32s:%(lineno)5s : %(message)s"
    console_formatter = logging.Formatter(console_format)
    console_handler.setFormatter(console_formatter)

    root_logger.addHandler(file_handler)
    root_logger.addHandler(console_handler)

    logger.info("Logging in '{}'".format(log_filename))

####################################################################################################

if __name__ == '__main__':

    try :
        os.makedirs(log_dir)
    except FileExistsError :
        pass

    install_logger()
    logger.info("Starting {}".format(program_name))

    dir_todo = '.'
    extensions_todo = ['', '.py', '.js', '.spec', '.txt', '.bat']
    regex_exclude = [
        r'.*/.hg/.*',
        r'.*/__pycache__/.*',
        r'.*/build/.*',
        r'.*/dist/.*',
        r'.*/logs/.*',
        r'.*/images/.*',
        ]

    for the_file in generate_files(dir_todo, extensions_todo, regex_exclude) :
        handle_file(f"{the_file}")

    logger.info("Ending {}".format(program_name))

####################################################################################################
