FROM python:3.6-alpine3.6

RUN apk add --no-cache --update libjpeg-turbo libxslt libxml2 libpng zlib curl

RUN apk add --no-cache --update --virtual .build-dependencies gcc python3-dev libxml2-dev libxslt-dev linux-headers musl-dev jpeg-dev zlib-dev libpng-dev \
    && rm -rf /var/cache/apk/*

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

RUN curl https://raw.githubusercontent.com/codelucas/newspaper/master/download_corpora.py | python3

RUN apk del .build-dependencies

COPY src .

CMD [ "python", "main.py" ]
