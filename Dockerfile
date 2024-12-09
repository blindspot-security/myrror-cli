FROM public.ecr.aws/docker/library/node:20-alpine AS development
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM public.ecr.aws/docker/library/node:20-alpine AS production
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY --from=development /usr/src/app/dist ./dist
ENV MYRROR_API=https://api.myrror.security/v1 \
    MYRROR_RETRY_TIME=10000 \
    MYRROR_TIMEOUT=3600000
RUN npm link
CMD ["myrror-cli"]