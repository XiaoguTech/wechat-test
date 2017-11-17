FROM node

RUN mkdir -p /wechat
WORKDIR /wechat
COPY . /wechat

RUN npm install 

VOLUME /wechat

EXPOSE 3000
ENTRYPOINT ["npm", "start"]
