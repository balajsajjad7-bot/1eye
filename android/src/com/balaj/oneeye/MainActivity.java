package com.balaj.oneeye;

import android.Manifest;
import android.app.Activity;
import android.app.DownloadManager;
import android.content.ClipData;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.provider.OpenableColumns;
import android.view.View;
import android.view.Window;
import android.webkit.DownloadListener;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;

public class MainActivity extends Activity {
    static final String HOST = "http://127.0.0.1:7777/";
    static final int REQ_FILES = 7, REQ_NOTIF = 8;

    private WebView web;
    private ValueCallback<Uri[]> fileCb;
    private final Handler ui = new Handler(Looper.getMainLooper());
    private boolean loaded = false;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        Window w = getWindow();
        w.setStatusBarColor(0xFF050507);
        w.setNavigationBarColor(0xFF050507);

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(0xFF050507);
        web = new WebView(this);
        web.setBackgroundColor(0xFF050507);
        root.addView(web);
        setContentView(root);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setSupportMultipleWindows(false);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                String h = u.getHost();
                if ("127.0.0.1".equals(h) || "localhost".equals(h)) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) { }
                return true;
            }

            @Override
            public void onReceivedError(WebView v, int code, String desc, String url) {
                ui.postDelayed(new Runnable() { public void run() { web.loadUrl(HOST); } }, 1200);
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (fileCb != null) fileCb.onReceiveValue(null);
                fileCb = cb;
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("*/*");
                i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                try {
                    startActivityForResult(Intent.createChooser(i, "Send with 1EYE"), REQ_FILES);
                } catch (Exception e) {
                    fileCb = null;
                    return false;
                }
                return true;
            }
        });

        web.setDownloadListener(new DownloadListener() {
            public void onDownloadStart(String url, String ua, String cd, String mime, long len) {
                try {
                    String name = URLUtil.guessFileName(url, cd, mime);
                    DownloadManager.Request r = new DownloadManager.Request(Uri.parse(url));
                    r.setTitle(name);
                    r.setDescription("1EYE");
                    r.setMimeType(mime);
                    r.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                    r.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, "1EYE/" + name);
                    ((DownloadManager) getSystemService(DOWNLOAD_SERVICE)).enqueue(r);
                    Toast.makeText(MainActivity.this, "Saving to Downloads/1EYE", Toast.LENGTH_SHORT).show();
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Download failed: " + e.getMessage(), Toast.LENGTH_LONG).show();
                }
            }
        });

        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, REQ_NOTIF);
        }

        startServer();
        web.loadDataWithBaseURL(null, splash(), "text/html", "utf-8", null);
        waitAndLoad();
        handleShare(getIntent());
    }

    private String splash() {
        return "<html><body style='margin:0;background:#050507;color:#8b88a2;font-family:sans-serif;display:flex;height:100vh;align-items:center;justify-content:center;flex-direction:column'>"
                + "<div style='font-size:44px;font-weight:800;letter-spacing:6px;background:linear-gradient(135deg,#c4b5fd,#8b5cf6,#67e8f9);-webkit-background-clip:text;color:transparent'>1EYE</div>"
                + "<div style='font-size:11px;letter-spacing:5px;margin-top:8px'>OPENING THE EYE…</div></body></html>";
    }

    private void startServer() {
        Intent i = new Intent(this, EyeService.class);
        startForegroundService(i);
    }

    private void waitAndLoad() {
        new Thread(new Runnable() {
            public void run() {
                for (int i = 0; i < 80; i++) {
                    if (ping()) {
                        ui.post(new Runnable() { public void run() { loaded = true; web.loadUrl(HOST); } });
                        return;
                    }
                    try { Thread.sleep(250); } catch (InterruptedException e) { return; }
                }
                ui.post(new Runnable() { public void run() {
                    Toast.makeText(MainActivity.this, "1EYE server didn't start. Try reopening the app.", Toast.LENGTH_LONG).show();
                } });
            }
        }).start();
    }

    static boolean ping() {
        try {
            HttpURLConnection c = (HttpURLConnection) new URL(HOST + "ping").openConnection();
            c.setConnectTimeout(600);
            c.setReadTimeout(600);
            int code = c.getResponseCode();
            c.disconnect();
            return code == 200;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    protected void onNewIntent(Intent i) {
        super.onNewIntent(i);
        handleShare(i);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (!EyeService.running) { startServer(); if (loaded) waitAndLoad(); }
    }

    /** "Share → 1EYE" from any app: drop the files straight into the shared folder. */
    private void handleShare(Intent intent) {
        if (intent == null) return;
        String a = intent.getAction();
        final ArrayList<Uri> uris = new ArrayList<Uri>();
        String text = null;
        if (Intent.ACTION_SEND.equals(a)) {
            Uri u = intent.getParcelableExtra(Intent.EXTRA_STREAM);
            if (u != null) uris.add(u); else text = intent.getStringExtra(Intent.EXTRA_TEXT);
        } else if (Intent.ACTION_SEND_MULTIPLE.equals(a)) {
            ArrayList<Uri> l = intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM);
            if (l != null) uris.addAll(l);
        } else return;
        intent.setAction(Intent.ACTION_MAIN);
        final String sharedText = text;
        new Thread(new Runnable() {
            public void run() {
                int ok = 0;
                File dir = new File(EyeService.dataDir(MainActivity.this), "1EYE_Shared");
                dir.mkdirs();
                for (Uri u : uris) {
                    try {
                        String name = displayName(u);
                        File out = unique(dir, name);
                        InputStream in = getContentResolver().openInputStream(u);
                        OutputStream os = new FileOutputStream(out);
                        byte[] buf = new byte[1 << 16];
                        int n;
                        while ((n = in.read(buf)) > 0) os.write(buf, 0, n);
                        os.close();
                        in.close();
                        ok++;
                    } catch (Exception ignored) { }
                }
                if (sharedText != null) postChat(sharedText);
                final int count = ok;
                final boolean txt = sharedText != null;
                ui.post(new Runnable() { public void run() {
                    if (count > 0) Toast.makeText(MainActivity.this, count + (count == 1 ? " file" : " files") + " sent to 1EYE", Toast.LENGTH_SHORT).show();
                    if (txt) Toast.makeText(MainActivity.this, "Sent to 1EYE chat", Toast.LENGTH_SHORT).show();
                } });
            }
        }).start();
    }

    private void postChat(String t) {
        for (int i = 0; i < 40 && !ping(); i++) { try { Thread.sleep(250); } catch (InterruptedException e) { return; } }
        try {
            HttpURLConnection c = (HttpURLConnection) new URL(HOST + "api/chat").openConnection();
            c.setRequestMethod("POST");
            c.setDoOutput(true);
            c.setRequestProperty("Content-Type", "application/json");
            String body = "{\"text\":" + jsonString(t) + "}";
            OutputStream os = c.getOutputStream();
            os.write(body.getBytes("UTF-8"));
            os.close();
            c.getResponseCode();
            c.disconnect();
        } catch (Exception ignored) { }
    }

    static String jsonString(String s) {
        StringBuilder b = new StringBuilder("\"");
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"': b.append("\\\""); break;
                case '\\': b.append("\\\\"); break;
                case '\n': b.append("\\n"); break;
                case '\r': b.append("\\r"); break;
                case '\t': b.append("\\t"); break;
                default:
                    if (c < 0x20) b.append(String.format("\\u%04x", (int) c)); else b.append(c);
            }
        }
        return b.append('"').toString();
    }

    private String displayName(Uri u) {
        String name = null;
        try {
            Cursor c = getContentResolver().query(u, new String[]{OpenableColumns.DISPLAY_NAME}, null, null, null);
            if (c != null) {
                if (c.moveToFirst()) name = c.getString(0);
                c.close();
            }
        } catch (Exception ignored) { }
        if (name == null) name = u.getLastPathSegment();
        if (name == null) name = "shared_" + System.currentTimeMillis();
        return name.replaceAll("[\\\\/:*?\"<>|]", "_");
    }

    private static File unique(File dir, String name) {
        File f = new File(dir, name);
        int dot = name.lastIndexOf('.');
        String base = dot > 0 ? name.substring(0, dot) : name, ext = dot > 0 ? name.substring(dot) : "";
        for (int i = 1; f.exists(); i++) f = new File(dir, base + " (" + i + ")" + ext);
        return f;
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        if (req == REQ_FILES && fileCb != null) {
            Uri[] result = null;
            if (res == RESULT_OK && data != null) {
                ClipData clip = data.getClipData();
                if (clip != null) {
                    result = new Uri[clip.getItemCount()];
                    for (int i = 0; i < clip.getItemCount(); i++) result[i] = clip.getItemAt(i).getUri();
                } else if (data.getData() != null) {
                    result = new Uri[]{data.getData()};
                }
            }
            fileCb.onReceiveValue(result);
            fileCb = null;
            return;
        }
        super.onActivityResult(req, res, data);
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack();
        else moveTaskToBack(true); // keep the server running in the background
    }
}
