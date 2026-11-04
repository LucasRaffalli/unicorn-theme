package com.lucasraffalli.unicorn.sparkles;

import java.awt.AlphaComposite;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.Rectangle;
import java.awt.Shape;
import java.awt.geom.AffineTransform;
import java.awt.geom.Path2D;
import java.util.concurrent.ThreadLocalRandom;

/** Un éclat à quatre branches aux courbes douces : tourne, tombe légèrement, rétrécit et s'éteint. */
final class Sparkle {
    private static final double GRAVITY = 0.045;
    private static final double MIN_SIZE = 3.5;
    private static final double MAX_SIZE = 7;
    private static final int MIN_LIFE = 40;
    private static final int MAX_LIFE = 80;

    private static final Shape UNIT = unitShape();

    private final Color color;
    private final double size;
    private final double spin;
    private final int maxLife;
    private double x;
    private double y;
    private double vx;
    private double vy;
    private double rotation;
    private int life;

    Sparkle(double x, double y, Color color) {
        ThreadLocalRandom random = ThreadLocalRandom.current();
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = random.nextDouble(MIN_SIZE, MAX_SIZE);
        this.vx = random.nextDouble(-0.6, 0.6);
        this.vy = random.nextDouble(-0.8, 0.2);
        this.spin = random.nextDouble(-0.06, 0.06);
        this.rotation = random.nextDouble(Math.PI);
        this.maxLife = random.nextInt(MIN_LIFE, MAX_LIFE + 1);
        this.life = maxLife;
    }

    /** Avance d'une image ; retourne false quand l'éclat est éteint. */
    boolean step() {
        x += vx;
        y += vy;
        vy += GRAVITY;
        rotation += spin;
        life--;
        return life > 0;
    }

    /** Zone à repeindre pour cet éclat (pointes comprises). */
    Rectangle bounds() {
        int radius = (int) Math.ceil(size) + 2;
        return new Rectangle((int) x - radius, (int) y - radius, radius * 2 + 1, radius * 2 + 1);
    }

    void paint(Graphics2D g) {
        double ratio = (double) life / maxLife;
        AffineTransform transform = new AffineTransform();
        transform.translate(x, y);
        transform.rotate(rotation);
        transform.scale(size * ratio, size * ratio);
        g.setComposite(AlphaComposite.SrcOver.derive((float) ratio));
        g.setColor(color);
        g.fill(transform.createTransformedShape(UNIT));
    }

    private static Shape unitShape() {
        double c = 0.16;
        Path2D path = new Path2D.Double();
        path.moveTo(0, -1);
        path.quadTo(c, -c, 1, 0);
        path.quadTo(c, c, 0, 1);
        path.quadTo(-c, c, -1, 0);
        path.quadTo(-c, -c, 0, -1);
        path.closePath();
        return path;
    }
}
