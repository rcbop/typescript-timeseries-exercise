# Using a Debian build
FROM node:16 as test

RUN apt-get install libcurl4

WORKDIR /project

COPY package.json package-lock.json ./
RUN npm install --ci

COPY . /project/
RUN npm install --ci

ENTRYPOINT ["npm", "run", "test"]
