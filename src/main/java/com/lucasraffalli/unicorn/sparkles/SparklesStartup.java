package com.lucasraffalli.unicorn.sparkles;

import com.intellij.ide.AppLifecycleListener;
import com.intellij.openapi.application.ApplicationManager;

/** Branche l'écoute du pointeur au démarrage de l'IDE. */
public final class SparklesStartup implements AppLifecycleListener {
    @Override
    public void appStarted() {
        ApplicationManager.getApplication().getService(SparklesService.class).start();
    }
}
