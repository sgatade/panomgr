FROM node:latest

WORKDIR /usr/src/panomgr

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
