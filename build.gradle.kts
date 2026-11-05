plugins {
    id("java")
    id("org.jetbrains.intellij.platform") version "2.5.0"
}

group = "com.lucasraffalli"
version = "1.2.0"

repositories {
    mavenCentral()
    intellijPlatform {
        defaultRepositories()
    }
}

dependencies {
    intellijPlatform {
        intellijIdeaCommunity("2024.3")
    }
}

intellijPlatform {
    // L'instrumentation (formulaires .form, assertions @NotNull) n'est pas utilisée ici
    instrumentCode = false

    pluginConfiguration {
        ideaVersion {
            sinceBuild = "243"
            untilBuild = provider { null }
        }
    }
}

// Bytecode Java 17 quel que soit le JDK qui lance Gradle (l'IDE embarque son propre runtime)
tasks.withType<JavaCompile> {
    options.release = 17
}
