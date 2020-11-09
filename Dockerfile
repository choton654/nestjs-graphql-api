FROM node:14

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# ENV MONGO_URI=mongodb+srv://choton654:9804750147@cluster0-prdkh.mongodb.net/lireddit

EXPOSE 5000

CMD ["npm", "start"]