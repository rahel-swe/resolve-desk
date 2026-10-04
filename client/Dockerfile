FROM oven/bun:1.4.0-debian

WORKDIR /app

RUN mkdir -p /app/data && chown -R bun:bun /app

COPY --chown=bun:bun package.json bun.lock ./

USER bun

RUN bun install --frozen-lockfile

COPY --chown=bun:bun . .

ENV VITE_API_BASE_URL=http://localhost:5051

EXPOSE 3000

CMD [ "bun", "dev", "--host", "0.0.0.0", "--port", "3000" ]