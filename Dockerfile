FROM node:20.11.0-alpine3.18

RUN apk --no-cache add curl

WORKDIR /app/
COPY . /app/

RUN npm ci
RUN npm run build

CMD [ "npm", "run", "start" ]