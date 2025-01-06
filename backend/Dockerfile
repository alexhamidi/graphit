FROM eclipse-temurin:17 AS build

WORKDIR /app

COPY mvnw ./
COPY .mvn .mvn
COPY pom.xml ./
COPY src ./src

RUN ./mvnw clean install

FROM eclipse-temurin:17-jre

WORKDIR /app

RUN apt-get update && apt-get install -y ca-certificates && update-ca-certificates


COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]

