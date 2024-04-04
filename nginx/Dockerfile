FROM nginx:1.24.0

COPY ./banned_ips.conf /etc/nginx/conf.d/banned_ips.conf
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./static/html/ /usr/share/nginx/html/
COPY ./static/fonts/ /usr/share/nginx/fonts/