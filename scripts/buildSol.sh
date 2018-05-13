#!/bin/sh

rm -f ../eth-app/ethereum/ABIs/*

solc -o ../eth-app/ethereum/ABIs/ --optimize --bin ../contracts/*.sol --abi --overwrite