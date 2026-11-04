package com.lucasraffalli.unicorn.sparkles;

import com.intellij.openapi.ui.AbstractPainter;

import javax.swing.Timer;
import java.awt.Color;
import java.awt.Component;
import java.awt.Graphics2D;
import java.awt.Rectangle;
import java.awt.RenderingHints;
import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * Couche de dessin posée sur la glass pane d'une fenêtre de l'IDE.
 * Le timer ne tourne que tant qu'il reste des éclats : rien ne bouge quand le pointeur est immobile.
 */
final class SparkleLayer extends AbstractPainter {
    private static final int MAX_SPARKLES = 34;
    private static final int FRAME_MS = 16;

    private final WeakReference<Component> glassRef;
    private final List<Sparkle> sparkles = new ArrayList<>();
    private final Timer timer = new Timer(FRAME_MS, event -> tick());

    SparkleLayer(Component glass) {
        this.glassRef = new WeakReference<>(glass);
    }

    void spawn(double x, double y, Color color) {
        if (sparkles.size() >= MAX_SPARKLES) {
            return;
        }
        sparkles.add(new Sparkle(x, y, color));
        if (!timer.isRunning()) {
            timer.start();
        }
    }

    @Override
    public boolean needsRepaint() {
        return !sparkles.isEmpty();
    }

    @Override
    public void executePaint(Component component, Graphics2D g) {
        Graphics2D g2 = (Graphics2D) g.create();
        try {
            g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            for (Sparkle sparkle : sparkles) {
                sparkle.paint(g2);
            }
        } finally {
            g2.dispose();
        }
    }

    private void tick() {
        Component glass = glassRef.get();
        if (glass == null) {
            sparkles.clear();
            timer.stop();
            return;
        }
        Iterator<Sparkle> it = sparkles.iterator();
        while (it.hasNext()) {
            Sparkle sparkle = it.next();
            Rectangle dirty = sparkle.bounds();
            boolean alive = sparkle.step();
            if (alive) {
                dirty = dirty.union(sparkle.bounds());
            } else {
                it.remove();
            }
            glass.repaint(dirty.x, dirty.y, dirty.width, dirty.height);
        }
        if (sparkles.isEmpty()) {
            timer.stop();
        }
    }
}
