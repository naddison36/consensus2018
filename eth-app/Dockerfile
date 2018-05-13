FROM node:8 AS build-env

WORKDIR /app
COPY package.json ./
RUN npm set progress=false && \
    npm config set depth 0 && \
    npm install --only=production && \
    npm cache clean --force
COPY . ./

FROM gcr.io/distroless/nodejs
COPY --from=build-env /eth-app /app
WORKDIR /app

# The default value will be overridden in test, staging and production by Kubernetes deployment files. For example
    # spec:
    #   containers:
    #     env:
    #     - name: NODE_ENV
    #       value: azure-test
ENV NODE_ENV development

# git_hash is passed into the build with the following command line option
# --build-arg git_hash=`git log -1 --pretty=%h`
ARG git_hash
ENV GIT_HASH ${git_hash}

# The export being exposed can be overridden by Kubernetes deployment files
EXPOSE 5000

CMD ["./index.js"]
