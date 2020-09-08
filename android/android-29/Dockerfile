# TODO - Publish our own Docker image
FROM docker.pkg.github.com/aleph-labs/aleph-docker-android-base/android-base:v1.0.0
LABEL maintainer="Aleph Labs <engineering@aleph-labs.com>"

ENV BUILD_TOOLS "29.0.3"
ENV TARGET_SDK "29"
ENV PATH $PATH:${ANDROID_HOME}/build-tools/${BUILD_TOOLS}

# Install SDK Packages
RUN sdkmanager "build-tools;${BUILD_TOOLS}" "platforms;android-${TARGET_SDK}"

# GitHub
ADD entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]