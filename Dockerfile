FROM alpine:3.5

RUN apk add --update nodejs

WORKDIR /var/wechat

COPY ./ /var/wechat

RUN npm install 

VOLUME /var/wechat

EXPOSE 3000
ENTRYPOINT ["npm", "start"]
