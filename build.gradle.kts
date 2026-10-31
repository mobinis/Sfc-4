plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.kotlin.serialization) apply false
    alias(libs.plugins.google.services) apply false
    alias(libs.plugins.ksp) apply false
}

tasks.register<Exec>("webBuild") {
    commandLine("npm", "run", "build")
}

tasks.register<Exec>("webLint") {
    commandLine("npx", "tsc", "--noEmit")
}
