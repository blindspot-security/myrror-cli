FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

ENV MYRROR_API=https://api.blindspot-security.com/v1 \
    MYRROR_RETRY_TIME=10000 \
    MYRROR_TIMEOUT=3600000 \
    MYRROR_CLIENT_ID= \
    MYRROR_CLIENT_SECRET= \
    MYRROR_REPOSITORY= \
    MYRROR_BRANCH= \
    MYRROR_COMMIT=
