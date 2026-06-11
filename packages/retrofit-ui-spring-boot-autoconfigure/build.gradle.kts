plugins {
    `java-library`
}

dependencies {
    compileOnly(libs.spring.boot.autoconfigure)
    compileOnly(libs.spring.boot.starter.web)
    annotationProcessor(libs.spring.boot.config.proc)
}

// ── SPA asset bundling ────────────────────────────────────────────────────
val spaVersion: String by project.extra.properties.withDefault { "0.0.1" }
val spaPackDir = layout.buildDirectory.dir("spa-pack")
val spaResourcesDir = "src/main/resources/META-INF/resources/retrofit-ui"

val downloadSpaAssets by tasks.registering(Exec::class) {
    group = "spa"
    description = "Downloads and extracts @retrofit-ui/spa-solid-shoelace npm package"
    val workDir = spaPackDir.get().asFile
    workDir.mkdirs()
    workingDir = workDir
    outputs.dir(workDir)

    val localTarball = findProperty("localSpaTarball") as String?
    if (localTarball != null) {
        commandLine("bash", "-c", "tar -xzf \"${localTarball}\"")
    } else {
        commandLine("bash", "-c", "npm pack @retrofit-ui/spa-solid-shoelace@${spaVersion} 2>/dev/null && tar -xzf *.tgz")
    }
}

val copySpaAssets by tasks.registering(Copy::class) {
    dependsOn(downloadSpaAssets)
    from(spaPackDir.get().dir("package/dist/ui-shell"))
    into(layout.projectDirectory.dir(spaResourcesDir))
}

// Only run if the resources dir is empty (i.e., assets not already present)
tasks.named("processResources") {
    if (!layout.projectDirectory.dir(spaResourcesDir).asFile.list()
            .orEmpty().any { it != ".gitkeep" }) {
        dependsOn(copySpaAssets)
    }
}
