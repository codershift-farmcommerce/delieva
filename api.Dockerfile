FROM node:20.11-bookworm

WORKDIR /var/app/api

WORKDIR /tmp
COPY ./api/package.json /tmp/
RUN yarn install && yarn global add knex -y
WORKDIR /var/app/api
COPY ./api /var/app/api
COPY ./interface /var/app/interface
RUN cp -a /tmp/node_modules /var/app/api

EXPOSE 3003
EXPOSE 8226
CMD [ "yarn", "dev" ]
