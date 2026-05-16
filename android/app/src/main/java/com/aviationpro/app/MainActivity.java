package com.aviationpro.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.google.android.gms.wearable.PutDataMapRequest;
import com.google.android.gms.wearable.PutDataRequest;
import com.google.android.gms.wearable.Wearable;
import android.webkit.JavascriptInterface;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Add a Javascript Interface so React can call native Wear functions
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
