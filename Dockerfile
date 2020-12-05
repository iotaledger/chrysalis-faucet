FROM node:12.20-buster AS build

RUN apt-get update && \
    apt-get install -y --no-install-recommends git ca-certificates gcc libc6-dev wget libssl-dev cmake && \
    rm -rf /var/lib/apt/lists/*

# From https://github.com/rust-lang/docker-rust/blob/c5461fab71272c9adca4804a73095a6642810f20/1.48.0/buster/slim/Dockerfile

ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH \
    RUST_VERSION=1.48.0

RUN set -eux; \
    dpkgArch="$(dpkg --print-architecture)"; \
    case "${dpkgArch##*-}" in \
        amd64) rustArch='x86_64-unknown-linux-gnu'; rustupSha256='49c96f3f74be82f4752b8bffcf81961dea5e6e94ce1ccba94435f12e871c3bdb' ;; \
        armhf) rustArch='armv7-unknown-linux-gnueabihf'; rustupSha256='5a2be2919319e8778698fa9998002d1ec720efe7cb4f6ee4affb006b5e73f1be' ;; \
        arm64) rustArch='aarch64-unknown-linux-gnu'; rustupSha256='d93ef6f91dab8299f46eef26a56c2d97c66271cea60bf004f2f088a86a697078' ;; \
        i386) rustArch='i686-unknown-linux-gnu'; rustupSha256='e3d0ae3cfce5c6941f74fed61ca83e53d4cd2deb431b906cbd0687f246efede4' ;; \
        *) echo >&2 "unsupported architecture: ${dpkgArch}"; exit 1 ;; \
    esac; \
    url="https://static.rust-lang.org/rustup/archive/1.22.1/${rustArch}/rustup-init"; \
    wget "$url"; \
    echo "${rustupSha256} *rustup-init" | sha256sum -c -; \
    chmod +x rustup-init; \
    ./rustup-init -y --no-modify-path --profile minimal --default-toolchain $RUST_VERSION --default-host ${rustArch}; \
    rm rustup-init; \
    chmod -R a+w $RUSTUP_HOME $CARGO_HOME; \
    rustup --version; \
    cargo --version; \
    rustc --version;

WORKDIR /app

COPY . /app

RUN npm ci && cd frontend && npm ci
RUN cd frontend && npm run build

# Add OpenSSL to linker search path for paho.mqtt.rust
ENV RUSTFLAGS="-L /usr/lib/x86_64-linux-gnu"

# Install wallet.rs bindings
RUN git clone https://github.com/iotaledger/wallet.rs && \
    cd wallet.rs/bindings/node && \
    npm install && \
    npx neon build --release && \
    npm link && \
    cd /app && \
    npm link iota-wallet

FROM node:12.20-buster-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends libssl-dev && \
    rm -rf /var/lib/apt/lists/*

EXPOSE 3000/tcp
EXPOSE 80/tcp

WORKDIR /app

COPY --from=build /app /app

RUN cd wallet.rs/bindings/node && \
    npm link && \
    cd /app && \
    npm link iota-wallet

ENTRYPOINT ["/bin/bash"]
