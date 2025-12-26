ARG DEVCONTAINER_REGISTRY
FROM ${DEVCONTAINER_REGISTRY}universal:4-linux

ARG DEVCONTAINER_REGISTRY
RUN if [ "${DEVCONTAINER_REGISTRY}" = "www.edu.info.suzuka-ct.ac.jp/" ]; then \
        echo 'export CONTAINER_REGISTRY="www.edu.info.suzuka-ct.ac.jp/"' >> /etc/bash.bashrc; \
    else \
        echo 'export CONTAINER_REGISTRY=""' >> /etc/bash.bashrc; \
    fi
