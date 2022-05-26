FROM node:16-alpine

WORKDIR /app

COPY package.json ./package.json
COPY yarn.lock ./yarn.lock

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

CMD ["node", "dist/index.js"]