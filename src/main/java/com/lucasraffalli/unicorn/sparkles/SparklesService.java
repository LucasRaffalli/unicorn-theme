package com.lucasraffalli.unicorn.sparkles;

import com.intellij.openapi.Disposable;
import com.intellij.openapi.components.Service;
import com.intellij.openapi.wm.IdeGlassPane;
import com.intellij.openapi.wm.IdeGlassPaneUtil;
import com.intellij.ui.JBColor;

import javax.swing.JRootPane;
import javax.swing.SwingUtilities;
import java.awt.AWTEvent;
import java.awt.Color;
import java.awt.Component;
import java.awt.IllegalComponentStateException;
import java.awt.Point;
import java.awt.Toolkit;
import java.awt.event.AWTEventListener;
import java.awt.event.MouseEvent;
import java.util.Map;
import java.util.WeakHashMap;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Suit le pointeur dans toutes les fenêtres de l'IDE et fait naître un éclat tous les 22 px parcourus.
 * Tout se passe sur l'EDT (les événements AWT y arrivent), donc pas de synchronisation.
 */
@Service(Service.Level.APP)
public final class SparklesService implements Disposable {
    private static final double SPAWN_DISTANCE = 22;
    private static final int MAX_SPAWNS_PER_EVENT = 3;

    // Séries de la variante : sombre puis claire (plus profondes pour rester visibles)
    private static final Color[] DARK = colors(0xf480c1, 0xe0559f, 0xbd93f9, 0xff9fd6, 0xc77dff);
    private static final Color[] LIGHT = colors(0xe0559f, 0xb83a7e, 0x8458ee, 0xcf4a95, 0x9a62e0);

    private static final Object UNSUPPORTED = new Object();

    private final AWTEventListener listener = this::onAwtEvent;
    private final Map<JRootPane, Object> layers = new WeakHashMap<>();
    private boolean started;
    private Point last;
    private double travelled;

    public void start() {
        if (started) {
            return;
        }
        started = true;
        Toolkit.getDefaultToolkit().addAWTEventListener(listener, AWTEvent.MOUSE_MOTION_EVENT_MASK);
    }

    @Override
    public void dispose() {
        Toolkit.getDefaultToolkit().removeAWTEventListener(listener);
        layers.clear();
    }

    private void onAwtEvent(AWTEvent event) {
        if (!(event instanceof MouseEvent mouse)) {
            return;
        }
        if (mouse.getID() != MouseEvent.MOUSE_MOVED && mouse.getID() != MouseEvent.MOUSE_DRAGGED) {
            return;
        }
        if (!SparklesSettings.getInstance().isEnabled()) {
            last = null;
            return;
        }

        Point screen;
        try {
            screen = mouse.getLocationOnScreen();
        } catch (IllegalComponentStateException e) {
            return;
        }
        if (last != null) {
            travelled += last.distance(screen);
        }
        last = screen;
        if (travelled < SPAWN_DISTANCE) {
            return;
        }

        JRootPane root = mouse.getComponent() == null ? null : SwingUtilities.getRootPane(mouse.getComponent());
        SparkleLayer layer = root == null ? null : layerFor(root);
        if (layer == null) {
            travelled = 0;
            return;
        }

        Point local = new Point(screen);
        SwingUtilities.convertPointFromScreen(local, root.getGlassPane());
        int spawned = 0;
        while (travelled >= SPAWN_DISTANCE && spawned < MAX_SPAWNS_PER_EVENT) {
            layer.spawn(local.x, local.y, pickColor());
            travelled -= SPAWN_DISTANCE;
            spawned++;
        }
        if (travelled >= SPAWN_DISTANCE) {
            travelled = 0;
        }
    }

    private SparkleLayer layerFor(JRootPane root) {
        Object known = layers.get(root);
        if (known == UNSUPPORTED) {
            return null;
        }
        if (known instanceof SparkleLayer layer) {
            return layer;
        }
        Component glass = root.getGlassPane();
        try {
            IdeGlassPane pane = IdeGlassPaneUtil.find(root);
            SparkleLayer layer = new SparkleLayer(glass);
            pane.addPainter(null, layer, this);
            layers.put(root, layer);
            return layer;
        } catch (RuntimeException e) {
            layers.put(root, UNSUPPORTED);
            return null;
        }
    }

    private static Color pickColor() {
        Color[] palette = JBColor.isBright() ? LIGHT : DARK;
        return palette[ThreadLocalRandom.current().nextInt(palette.length)];
    }

    private static Color[] colors(int... rgb) {
        Color[] result = new Color[rgb.length];
        for (int i = 0; i < rgb.length; i++) {
            result[i] = new Color(rgb[i]);
        }
        return result;
    }
}
