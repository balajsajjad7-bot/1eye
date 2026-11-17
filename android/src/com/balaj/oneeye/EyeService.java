package com.balaj.oneeye;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;

import java.io.File;
import java.io.InputStream;

/** Keeps the 1EYE server process alive in the background. */
public class EyeService extends Service {
    static final String CHANNEL = "eye";
    static final String ACTION_STOP = "com.balaj.oneeye.STOP";
    static volatile boolean running = false;

    private Process proc;
    private Thread loop;
    private PowerManager.WakeLock wake;
    private WifiManager.WifiLock wifi;

    @Override
    public IBinder onBind(Intent i) { return null; }

    static File dataDir(Context c) {
        File d = c.getExternalFilesDir(null);
        if (d == null) d = c.getFilesDir();
        d.mkdirs();
        return d;
    }

    static String binary(Context c, boolean fallback) {
        String dir = c.getApplicationInfo().nativeLibraryDir;
        if (fallback && new File(dir, "lib1eyestatic.so").exists()) return dir + "/lib1eyestatic.so";
        return dir + "/lib1eye.so";
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_STOP.equals(intent.getAction())) {
            shutdown();
            return START_NOT_STICKY;
        }
        startForeground(1, buildNotification());
        if (!running) {
            running = true;
            acquireLocks();
            loop = new Thread(new Runnable() {
                public void run() { superviseServer(); }
            }, "1eye-supervisor");
            loop.start();
        }
        return START_STICKY;
    }

    private void superviseServer() {
        int quickFails = 0;
        while (running) {
            if (MainActivity.ping()) { // a server is already answering — just watch it
                try { Thread.sleep(3000); } catch (InterruptedException ie) { return; }
                continue;
            }
            long started = System.currentTimeMillis();
            try {
                File dir = dataDir(this);
                String name = Build.MANUFACTURER == null ? Build.MODEL :
                        (Build.MODEL.toLowerCase().startsWith(Build.MANUFACTURER.toLowerCase()) ? Build.MODEL : capitalize(Build.MANUFACTURER) + " " + Build.MODEL);
                ProcessBuilder pb = new ProcessBuilder(binary(this, quickFails >= 2), "--headless", "--dir", dir.getAbsolutePath(), "--name", name);
                pb.directory(dir);
                pb.redirectErrorStream(true);
                pb.environment().put("HOME", dir.getAbsolutePath());
                pb.environment().put("TMPDIR", getCacheDir().getAbsolutePath());
                proc = pb.start();
                InputStream in = proc.getInputStream();
                byte[] buf = new byte[4096];
                while (in.read(buf) != -1) { /* drain output */ }
                int code = proc.waitFor();
                if (System.currentTimeMillis() - started < 4000 && code != 0) quickFails++;
                if (code == 0 && System.currentTimeMillis() - started > 4000) { // user pressed "Shut down" in the app
                    running = false;
                    stopEverything();
                    return;
                }
            } catch (Exception e) {
                // fall through and retry
            }
            try { Thread.sleep(1500); } catch (InterruptedException ie) { return; }
        }
    }

    private static String capitalize(String s) {
        return s.isEmpty() ? s : Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }

    private void acquireLocks() {
        try {
            PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
            wake = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "1eye:server");
            wake.acquire();
            WifiManager wm = (WifiManager) getApplicationContext().getSystemService(WIFI_SERVICE);
            wifi = wm.createWifiLock(WifiManager.WIFI_MODE_FULL_HIGH_PERF, "1eye:wifi");
            wifi.acquire();
        } catch (Exception ignored) { }
    }

    private void releaseLocks() {
        try { if (wake != null && wake.isHeld()) wake.release(); } catch (Exception ignored) { }
        try { if (wifi != null && wifi.isHeld()) wifi.release(); } catch (Exception ignored) { }
    }

    private Notification buildNotification() {
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        NotificationChannel ch = new NotificationChannel(CHANNEL, "1EYE server", NotificationManager.IMPORTANCE_LOW);
        ch.setDescription("Shows while 1EYE is sharing from this phone");
        nm.createNotificationChannel(ch);

        int piFlags = PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE;
        PendingIntent open = PendingIntent.getActivity(this, 0, new Intent(this, MainActivity.class), piFlags);
        Intent stop = new Intent(this, EyeService.class).setAction(ACTION_STOP);
        PendingIntent stopPi = PendingIntent.getService(this, 1, stop, piFlags);

        return new Notification.Builder(this, CHANNEL)
                .setSmallIcon(R.drawable.ic_stat)
                .setContentTitle("1EYE is awake")
                .setContentText("Sharing from this phone · tap to open")
                .setContentIntent(open)
                .setOngoing(true)
                .setColor(0xFFA78BFA)
                .addAction(new Notification.Action.Builder(null, "Shut down", stopPi).build())
                .build();
    }

    private void shutdown() {
        running = false;
        if (proc != null) proc.destroy();
        stopEverything();
    }

    private void stopEverything() {
        releaseLocks();
        if (Build.VERSION.SDK_INT >= 24) stopForeground(STOP_FOREGROUND_REMOVE); else stopForeground(true);
        stopSelf();
    }

    @Override
    public void onDestroy() {
        running = false;
        if (proc != null) proc.destroy();
        releaseLocks();
        super.onDestroy();
    }
}
