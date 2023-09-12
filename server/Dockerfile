FROM node:18

WORKDIR /server
COPY ./ /server

RUN npm config set strict-ssl false
RUN npm install -D ts-node
RUN npm install

EXPOSE 3000

CMD npm run start
