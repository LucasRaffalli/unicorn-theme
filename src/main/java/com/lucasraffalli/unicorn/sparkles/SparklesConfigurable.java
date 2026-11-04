package com.lucasraffalli.unicorn.sparkles;

import com.intellij.openapi.options.Configurable;
import com.intellij.ui.components.JBCheckBox;
import org.jetbrains.annotations.Nls;
import org.jetbrains.annotations.Nullable;

import javax.swing.JComponent;
import javax.swing.JPanel;
import java.awt.FlowLayout;

/** Page de réglages : Appearance & Behavior > Appearance > Unicorn Sparkles. */
public final class SparklesConfigurable implements Configurable {
    private JBCheckBox enabled;

    @Override
    public @Nls String getDisplayName() {
        return "Unicorn Sparkles";
    }

    @Override
    public @Nullable JComponent createComponent() {
        enabled = new JBCheckBox("Show sparkles that follow the mouse pointer");
        JPanel panel = new JPanel(new FlowLayout(FlowLayout.LEFT));
        panel.add(enabled);
        return panel;
    }

    @Override
    public boolean isModified() {
        return enabled != null && enabled.isSelected() != SparklesSettings.getInstance().isEnabled();
    }

    @Override
    public void apply() {
        SparklesSettings.getInstance().setEnabled(enabled.isSelected());
    }

    @Override
    public void reset() {
        enabled.setSelected(SparklesSettings.getInstance().isEnabled());
    }

    @Override
    public void disposeUIResources() {
        enabled = null;
    }
}
