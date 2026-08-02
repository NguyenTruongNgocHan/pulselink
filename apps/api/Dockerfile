FROM eclipse-temurin:21-jdk AS build

WORKDIR /workspace

COPY .mvn .mvn
COPY mvnw pom.xml ./

RUN chmod +x mvnw \
    && ./mvnw -q -DskipTests dependency:go-offline

COPY src src

RUN ./mvnw -q clean verify


FROM eclipse-temurin:21-jre

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        gosu \
    && rm -rf /var/lib/apt/lists/*

RUN useradd \
    --system \
    --uid 10001 \
    --create-home \
    --shell /usr/sbin/nologin \
    pulselink

RUN mkdir -p /data/uploads \
    && chown -R pulselink:pulselink /data \
    && chmod 750 /data/uploads

COPY --from=build \
    --chown=pulselink:pulselink \
    /workspace/target/*.jar \
    /app/app.jar

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh \
    && chmod 755 /usr/local/bin/docker-entrypoint.sh

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=10 \
    CMD curl --fail --silent http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

CMD ["java","-XX:MaxRAMPercentage=75","-jar","/app/app.jar"]