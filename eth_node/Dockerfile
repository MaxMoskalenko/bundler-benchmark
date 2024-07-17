FROM ghcr.io/foundry-rs/foundry:nightly-156cb1396b7076c6f9cb56f3719f8c90f7f52064

WORKDIR /app

RUN apk update 
RUN apk upgrade
RUN apk add npm

COPY package.json .
COPY package-lock.json .
COPY contracts contracts
COPY scripts/ .
COPY entrypoint.sh .

RUN npm i

RUN chmod +x entrypoint.sh

ENTRYPOINT ./entrypoint.sh
