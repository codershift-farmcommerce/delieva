FROM nginx:latest

COPY nginx.conf /etc/nginx/nginx.conf
COPY farmcommerce.crt /etc/ssl/certs/farmcommerce.crt
COPY farmcommerce.key /etc/ssl/private/farmcommerce.key

EXPOSE 80
