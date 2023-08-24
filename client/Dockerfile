FROM node:18

WORKDIR /client

COPY ./ /client

RUN npm config set strict-ssl false
RUN apt-get update && apt-get install -y xdg-utils
RUN npm install
RUN npm install vite
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
