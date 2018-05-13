#!/bin/sh

if [ ! -d "../testchain/parity" ]; then
    mkdir ../testchain/parity
fi

pid=$(lsof -i:8646 -t); kill -TERM $pid || kill -KILL $pid

parity --chain testchainSpec.json --config parityDevConfig.toml

# generates a UI token
#parity --chain testchainSpec.json --config parityDevConfig.toml signer new-token
