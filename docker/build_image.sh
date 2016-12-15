#!/bin/bash

useradd routerboard

apt-get update
apt-get install --no-install-recommends -y \
    npm

php /composer-setup.php --install-dir=/usr/bin --filename=composer
rm /composer-setup.php

cd /var/www/html
composer install
npm install

chown -R routerboard: /var/www/html/*
