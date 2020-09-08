# TODO - Publish our own Docker image
FROM alephlabs/android-29:v1.0.0
LABEL maintainer="Aleph Labs <engineering@aleph-labs.com>"

# GitHub
ADD entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]