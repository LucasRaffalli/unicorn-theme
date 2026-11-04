package com.lucasraffalli.unicorn.sparkles;

import com.intellij.openapi.actionSystem.ActionUpdateThread;
import com.intellij.openapi.actionSystem.AnActionEvent;
import com.intellij.openapi.actionSystem.ToggleAction;
import com.intellij.openapi.project.DumbAware;
import org.jetbrains.annotations.NotNull;

/** Menu Tools > Unicorn Sparkles : active ou coupe les paillettes à la volée. */
public final class ToggleSparklesAction extends ToggleAction implements DumbAware {
    @Override
    public boolean isSelected(@NotNull AnActionEvent event) {
        return SparklesSettings.getInstance().isEnabled();
    }

    @Override
    public void setSelected(@NotNull AnActionEvent event, boolean state) {
        SparklesSettings.getInstance().setEnabled(state);
    }

    @Override
    public @NotNull ActionUpdateThread getActionUpdateThread() {
        return ActionUpdateThread.BGT;
    }
}
