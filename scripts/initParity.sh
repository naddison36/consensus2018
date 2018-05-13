#!/bin/sh

if [ ! -d "../testchain" ]; then
    mkdir ../testchain
fi

if [ ! -d "../testchain/parity" ]; then
    mkdir ../testchain/parity
fi

rm -f -r ../testchain/parity/*