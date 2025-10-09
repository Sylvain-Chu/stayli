FROM node:22-alpine
WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn prisma generate
RUN yarn build

EXPOSE 3000
RUN apk add --no-cache postgresql-client

COPY ./scripts/wait-for-db.sh /usr/local/bin/wait-for-db.sh
RUN chmod +x /usr/local/bin/wait-for-db.sh

ENTRYPOINT ["/usr/local/bin/wait-for-db.sh"]
CMD ["node", "dist/main"]