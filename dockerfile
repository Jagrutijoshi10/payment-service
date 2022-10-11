FROM node:10-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

COPY --chown=node:node . .

EXPOSE 2040

#CMD [ "npm", "run", "stage2-topup" ]
#CMD [ "npm", "run", "stage2" ]
CMD [ "npm", "run", "prod-topup" ]
#CMD [ "npm", "run", "prod" ]
