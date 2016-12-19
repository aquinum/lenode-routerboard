#!/bin/bash

useradd routerboard

apt-get update
apt-get install --no-install-recommends -y \
    npm \
    git

php /composer-setup.php --install-dir=/usr/bin --filename=composer
rm /composer-setup.php

cd /var/www/html
composer install --prefer-dist --no-dev --optimize-autoloader
npm install

chown -R routerboard: /var/www/html/*
