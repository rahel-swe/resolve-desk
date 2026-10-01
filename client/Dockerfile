FROM oven/bun:1.4.0-debian

WORKDIR /app

RUN chown bun:bun /app

COPY --chown=bun:bun package.json bun.lock ./

USER bun

RUN bun install --frozen-lockfile

COPY --chown=bun:bun . .

ENV API_URL=http://api.myapp.com/

EXPOSE 3000

CMD [ "bun", "dev" ]