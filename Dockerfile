FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

ENV MYRROR_CLIENT_ID=your-client-id \
    MYRROR_SECRET=your-secret \
    MYRROR_API=https://api.blindspot-security.com/v1 \
    MYRROR_REPOSITORY=your-repository \
    MYRROR_BRANCH=your-branch \
    MYRROR_COMMIT=your-commit \
    MYRROR_RETRY_TIME=10000 \
    MYRROR_TIMEOUT=3600000
