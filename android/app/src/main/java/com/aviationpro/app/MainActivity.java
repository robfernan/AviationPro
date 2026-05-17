package com.aviationpro.app;

import android.os.Bundle;
import android.util.Log;
import com.getcapacitor.BridgeActivity;
import com.google.android.gms.wearable.PutDataMapRequest;
import com.google.android.gms.wearable.PutDataRequest;
import com.google.android.gms.wearable.Wearable;
import android.webkit.JavascriptInterface;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "AVPRO_PHONE";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onStart() {
        super.onStart();
        if (bridge != null && bridge.getWebView() != null) {
            Log.d(TAG, "Binding AndroidWatchBridge to WebView");
            bridge.getWebView().addJavascriptInterface(new Object() {
                @JavascriptInterface
                public void updateWatchWeather(String category) {
                    Log.d(TAG, "Javascript bridge called with category: " + category);
                    try {
                        PutDataMapRequest dataMap = PutDataMapRequest.create("/weather");
                        dataMap.getDataMap().putString("category", category);
                        dataMap.getDataMap().putLong("timestamp", System.currentTimeMillis());
                        PutDataRequest request = dataMap.asPutDataRequest();
                        request.setUrgent();
                        Wearable.getDataClient(MainActivity.this)
                            .putDataItem(request)
                            .addOnSuccessListener(dataItem -> Log.d(TAG, "Successfully sent data to watch"))
                            .addOnFailureListener(e -> Log.e(TAG, "Failed to send data to watch", e));
                    } catch (Exception e) {
                        Log.e(TAG, "Error in updateWatchWeather bridge", e);
                    }
                }
            }, "AndroidWatchBridge");
        }
    }
}