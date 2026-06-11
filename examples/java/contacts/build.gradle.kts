plugins {
    alias(libs.plugins.spring.boot)
}

dependencies {
    implementation(project(":packages:retrofit-ui-spring-boot-starter"))
    testImplementation(libs.spring.boot.starter.test)
    testImplementation(libs.playwright)
}

val installPlaywrightBrowsers by tasks.registering(JavaExec::class) {
    group = "playwright"
    description = "Installs Chromium browser for Playwright tests"
    classpath = sourceSets["test"].runtimeClasspath
    mainClass.set("com.microsoft.playwright.CLI")
    args = listOf("install", "--with-deps", "chromium")
}

tasks.named("test") {
    dependsOn(installPlaywrightBrowsers)
}
