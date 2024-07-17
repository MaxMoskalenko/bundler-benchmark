#!/bin/sh

nohup anvil --host "0.0.0.0" --block-time 1 --gas-limit 1000000000 & 

while ! nc -z "0.0.0.0" 8545; do
  sleep 1
done

NODE_PATH=$(npm root -g) node /app/entrypoint.js

while nc -z "0.0.0.0" 8545; do
  sleep 1
done
