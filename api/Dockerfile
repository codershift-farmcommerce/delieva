FROM node:20.11-bookworm

WORKDIR /var/app

WORKDIR /tmp
COPY package.json /tmp/
RUN yarn install && yarn global add knex -y
WORKDIR /var/app
COPY . /var/app/
RUN cp -a /tmp/node_modules /var/app/

EXPOSE 3003
EXPOSE 8226
CMD [ "yarn", "dev" ]
