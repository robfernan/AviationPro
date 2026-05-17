package com.aviationpro.app;

import android.os.Bundle;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;
import com.google.android.gms.wearable.PutDataMapRequest;
import com.google.android.gms.wearable.PutDataRequest;
import com.google.android.gms.wearable.Wearable;
import android.webkit.JavascriptInterface;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Install the splash screen before calling super.onCreate()
        SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onStart() {
        super.onStart();
        // Add Javascript Interface in onStart to ensure WebView is ready
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().addJavascriptInterface(new Object() {
                @JavascriptInterface
                public void updateWatchWeather(String category) {
                    PutDataMapRequest dataMap = PutDataMapRequest.create("/weather");
                    dataMap.getDataMap().putString("category", category);
                    dataMap.getDataMap().putLong("timestamp", System.currentTimeMillis());
                    PutDataRequest request = dataMap.asPutDataRequest();
                    request.setUrgent();
                    Wearable.getDataClient(MainActivity.this).putDataItem(request);
                }
            }, "AndroidWatchBridge");
        }
    }
}