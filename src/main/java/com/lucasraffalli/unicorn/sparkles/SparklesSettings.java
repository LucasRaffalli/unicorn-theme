package com.lucasraffalli.unicorn.sparkles;

import com.intellij.openapi.application.ApplicationManager;
import com.intellij.openapi.components.PersistentStateComponent;
import com.intellij.openapi.components.Service;
import com.intellij.openapi.components.State;
import com.intellij.openapi.components.Storage;
import com.intellij.util.xmlb.XmlSerializerUtil;
import org.jetbrains.annotations.NotNull;

/** Réglage persistant : paillettes actives ou non (actives par défaut). */
@Service(Service.Level.APP)
@State(name = "UnicornSparklesSettings", storages = @Storage("unicorn-sparkles.xml"))
public final class SparklesSettings implements PersistentStateComponent<SparklesSettings.State> {

    public static final class State {
        public boolean enabled = true;
    }

    private State state = new State();

    public static SparklesSettings getInstance() {
        return ApplicationManager.getApplication().getService(SparklesSettings.class);
    }

    public boolean isEnabled() {
        return state.enabled;
    }

    public void setEnabled(boolean enabled) {
        state.enabled = enabled;
    }

    @Override
    public @NotNull State getState() {
        return state;
    }

    @Override
    public void loadState(@NotNull State loaded) {
        XmlSerializerUtil.copyBean(loaded, state);
    }
}
