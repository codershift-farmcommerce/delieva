FROM node:20.11-bookworm

WORKDIR /var/app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

EXPOSE 3000

CMD yarn dev
