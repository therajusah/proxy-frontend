# Static public site served by Caddy. On Railway the container listens on $PORT.
FROM caddy:2-alpine

COPY Caddyfile /etc/caddy/Caddyfile
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Site files -> /srv, then drop repo/infra files from the served root.
COPY . /srv
RUN rm -f /srv/Dockerfile /srv/Caddyfile /srv/docker-entrypoint.sh \
          /srv/README.md /srv/.gitignore /srv/.dockerignore

ENTRYPOINT ["/docker-entrypoint.sh"]
