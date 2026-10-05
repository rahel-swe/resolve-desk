FROM oven/bun:1.4.0-debian

WORKDIR /app

RUN useradd --create-home --shell /bin/bash rahel \
    && mkdir -p /app/data \
    && chown -R rahel:rahel /app

COPY --chown=rahel:rahel package.json bun.lock ./

USER rahel

RUN bun install --frozen-lockfile

COPY --chown=rahel:rahel . .

ENV VITE_API_BASE_URL=http://localhost:5051

EXPOSE 3000

CMD [ "bun", "run", "dev" ]
