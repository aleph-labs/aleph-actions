# TODO - Publish our own Docker image
FROM alephlabs/android-29:v1.0.0
LABEL maintainer="Aleph Labs <engineering@aleph-labs.com>"

# Copies your code file from your action repository to the filesystem path `/` of the container
COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

# Code file to execute when the docker container starts up (`entrypoint.sh`)
ENTRYPOINT ["/entrypoint.sh"]