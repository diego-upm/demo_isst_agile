#!/bin/sh
set -eu

: "${BACKEND_UPSTREAM_HOST:=backend}"
: "${BACKEND_UPSTREAM_PORT:=8080}"

envsubst '${BACKEND_UPSTREAM_HOST} ${BACKEND_UPSTREAM_PORT}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
