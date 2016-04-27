FROM node:5.11-onbuild
MAINTAINER edouglas92

RUN apt-get update && apt-get install -y libav-tools
ENV PATH=/usr/src/app/node_modules/.bin:$PATH

