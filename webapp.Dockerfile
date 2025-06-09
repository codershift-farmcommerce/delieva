FROM node:20.11-bookworm

WORKDIR /var/app/webapp
COPY ./webapp/package.json ./webapp/yarn.lock ./
RUN yarn install --frozen-lockfile
COPY ./webapp /var/app/webapp
COPY ./interface /var/app/interface
RUN yarn build

EXPOSE 3000

CMD yarn dev
