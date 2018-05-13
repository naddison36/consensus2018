
FROM parity/parity

COPY testchainSpec.json parityDevConfig.toml /app/

WORKDIR /app

EXPOSE 8646 8647 8181

CMD ["--chain", "testchainSpec.json", "--config", "parityDevConfig.toml", "--jsonrpc-interface", "all", "--jsonrpc-hosts", "all"]