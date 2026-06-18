FROM node:20
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app



#COPY package.json /usr/src/app/
COPY . /usr/src/app
RUN yarn install


WORKDIR /usr/src/app/apps/web
RUN yarn run build

EXPOSE 3000

CMD "yarn" "run" "start"