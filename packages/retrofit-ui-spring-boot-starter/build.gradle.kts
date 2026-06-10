plugins {
    `java-library`
}

dependencies {
    api(project(":packages:retrofit-ui-spring-boot-autoconfigure"))
    api(libs.spring.boot.starter.web)
}
