# -*- coding: utf-8 -*-
# vim: syntax=python ts=4 sw=4 sts=4 sr et columns=100 lines=45

#
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
#

#
# ATTENTION for 2 important remarks :
#    1. Do NOT use 'print', console loggers or anything else that writes to stdout.
#       It will jeopardize the communication to cb_background.js!
#    2. Note that running python with the `-u` flag is required on Windows,
#       in order to ensure that stdin and stdout are opened in binary, rather than text, mode.
#

#####

import json
import sys
import struct
import os
import logging
import time
import socket

if sys.platform == "win32" :
    import winreg
    import ctypes

#####

program_name    = 'cb_thunderlink'
author_mail     = 'camiel@bouchier.be'
server_address  = ('127.0.0.1', 1302)
protocol        = 'cbthunderlink'    # Protocol can not have _ !
protocol_string = protocol + "://"

this_dir = os.path.dirname(os.path.abspath(sys.argv[0]))
log_dir  = f"{this_dir}/logs"

if not os.path.exists(log_dir) :
    os.makedirs(log_dir)

logger = logging.getLogger(__name__)

#####

def get_log_filename() :

    log_filename = os.path.join(log_dir, "%s.log" % (program_name))
    return log_filename

#####

def install_logger() :

    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)

    file_handler = logging.FileHandler(get_log_filename(), mode='a')
    file_handler.setLevel(logging.DEBUG)
    file_formatter = logging.Formatter(
            '%(asctime)s - %(process)5d - %(levelname)s - %(lineno)4d : %(message)s')
    file_handler.setFormatter(file_formatter)

    root_logger.addHandler(file_handler)

#####

if __name__ == '__main__' :

    install_logger()
    logger.info("="*100)
    logger.info(f"Starting {program_name} ({sys.argv})")

    if len(sys.argv) > 1 and sys.argv[1] == "register" :

        # Registering (currently windows specific only)
        # (in this branch it is OK to use stdout => interactive)

        if sys.platform == "win32" :

            if not ctypes.windll.shell32.IsUserAnAdmin() :
                print("This must be run as administrator. You are just a mortal.")
                sys.exit()

            # We are setting up ourselves in the registry.
            print("Setting up the registry")

            # This are the keys for the native messaging registration.
            key = r'SOFTWARE\Mozilla\NativeMessagingHosts\cb_thunderlink'
            for K in [winreg.HKEY_CURRENT_USER, winreg.HKEY_LOCAL_MACHINE] :
                try :
                    reg_key = winreg.OpenKey(K, key, 0, winreg.KEY_ALL_ACCESS)
                except FileNotFoundError :
                    reg_key = winreg.CreateKey(K, key)
                val = os.path.join(this_dir, "cb_thunderlink.json")
                winreg.SetValueEx(reg_key, None, 0, winreg.REG_SZ, val)
                winreg.CloseKey(reg_key)

            # And here for the cbthunderlink:// OS integration
            K = winreg.HKEY_CLASSES_ROOT

            key = protocol
            try :
                reg_key = winreg.OpenKey(K, key, 0, winreg.KEY_ALL_ACCESS)
            except FileNotFoundError :
                reg_key = winreg.CreateKey(K, key)
            winreg.SetValueEx(reg_key, None, 0, winreg.REG_SZ, f"URL:{protocol} Protocol")
            winreg.SetValueEx(reg_key, "URL Protocol", 0, winreg.REG_SZ, "")
            winreg.CloseKey(reg_key)

            key = protocol + r'\shell\open\command'
            try :
                reg_key = winreg.OpenKey(K, key, 0, winreg.KEY_ALL_ACCESS)
            except FileNotFoundError :
                reg_key = winreg.CreateKey(K, key)
            val = os.path.join(this_dir, "cb_thunderlink.exe \"%1\"")
            winreg.SetValueEx(reg_key, None, 0, winreg.REG_SZ, val)
            winreg.CloseKey(reg_key)

            print("Registry setup finished")

    elif len(sys.argv) > 1 and sys.argv[1].startswith(protocol_string) :

        # We are the command line interface.
        # Get the argument and send the identifier over the socket to our listening instance.
        logger.info("Executing cb_thunderlink")
        send_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        send_socket.connect(server_address)
        message = sys.argv[1][len(protocol_string):].strip('/')
        logger.info(f"Message sent: {message}")
        encoded_content = json.dumps(message).encode("utf-8")
        encoded_length = struct.pack('=I', len(encoded_content))
        try :
            send_socket.send(encoded_length)
            send_socket.send(struct.pack(str(len(encoded_content))+"s",encoded_content))
        finally :
            send_socket.close()

    else :
        # We are the instance interfacing with background.js
        # Just listen on our socket and if something would be received,
        # pipe it through stdout to the web-extension.
        logger.info("Interfacing with background.js")
        receive_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        bind_tries = 0
        while bind_tries < 10 :
            try :
                logger.info(f"Trying to bind to {server_address}")
                receive_sock.bind(server_address)
                break
            except OSError :
                bind_tries += 1
                time.sleep(2)
        logger.info(f"Bound to {server_address}")
        receive_sock.listen(1)
        logger.info(f"Start listening on {server_address}")
        while True :
            connection, client_address = receive_sock.accept()
            logger.info(f"Connection from {client_address}")
            try :
                raw_length = connection.recv(4)
                if not raw_length:
                    sys.exit(0)
                message_length = struct.unpack('=I', raw_length)[0]
                message = connection.recv(message_length)
                sys.stdout.buffer.write(raw_length)
                sys.stdout.buffer.write(message)
                sys.stdout.buffer.flush()
            finally :
                connection.close()

    logger.info("Finishing {}".format(program_name))
    logger.info("="*100)

#####
