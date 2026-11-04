package com.lucasraffalli.unicorn.sparkles;

import com.intellij.openapi.application.ApplicationManager;
import com.intellij.openapi.project.Project;
import com.intellij.openapi.startup.ProjectActivity;
import kotlin.Unit;
import kotlin.coroutines.Continuation;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

/**
 * Démarre l'écoute du pointeur à l'ouverture d'un projet. Contrairement à AppLifecycleListener.appStarted,
 * cette activité tourne aussi pour les projets déjà ouverts quand le plugin est installé sans redémarrage.
 */
public final class SparklesProjectActivity implements ProjectActivity {
    @Override
    public @Nullable Object execute(@NotNull Project project, @NotNull Continuation<? super Unit> continuation) {
        ApplicationManager.getApplication().invokeLater(
                () -> ApplicationManager.getApplication().getService(SparklesService.class).start());
        return Unit.INSTANCE;
    }
}
