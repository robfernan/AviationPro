package com.aviationpro.wear.face.presentation

import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material3.Text
import com.google.android.gms.wearable.DataClient
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.Wearable

class MainActivity : ComponentActivity(), DataClient.OnDataChangedListener {

    private val _metarCategory = mutableStateOf("INITIALIZING")
    private val TAG = "AVPRO_WATCH"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        refreshData()

        setContent {
            WatchAppScreen(_metarCategory.value) {
                refreshData()
            }
        }
    }

    private fun refreshData() {
        Log.d(TAG, "Refreshing data from DataClient...")
        Wearable.getDataClient(this).dataItems.addOnSuccessListener { dataItems ->
            Log.d(TAG, "Successfully fetched ${dataItems.count} items")
            for (item in dataItems) {
                if (item.uri.path == "/weather") {
                    val cat = DataMapItem.fromDataItem(item).dataMap.getString("category", "VFR")
                    Log.d(TAG, "Found weather category in storage: $cat")
                    _metarCategory.value = cat
                }
            }
            if (_metarCategory.value == "INITIALIZING") {
                _metarCategory.value = "NO DATA"
            }
        }.addOnFailureListener { e ->
            Log.e(TAG, "Failed to fetch data items", e)
            _metarCategory.value = "SYNC ERR"
        }
    }

    override fun onResume() {
        super.onResume()
        Wearable.getDataClient(this).addListener(this)
        refreshData()
    }

    override fun onPause() {
        super.onPause()
        Wearable.getDataClient(this).removeListener(this)
    }

    override fun onDataChanged(dataEvents: DataEventBuffer) {
        Log.d(TAG, "onDataChanged triggered with ${dataEvents.count} events")
        for (event in dataEvents) {
            if (event.dataItem.uri.path == "/weather") {
                val cat = DataMapItem.fromDataItem(event.dataItem).dataMap.getString("category", "VFR")
                Log.d(TAG, "Data changed! New category: $cat")
                _metarCategory.value = cat
            }
        }
    }
}

@Composable
fun WatchAppScreen(category: String, onRefresh: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
            .clickable { onRefresh() }, // Allow user to tap to force refresh
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "AVPRO // LIVE",
                color = Color(0xFFFE0909),
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(bottom = 8.dp)
            )
            
            Text(
                text = "FLIGHT CAT",
                color = Color.Gray,
                fontSize = 10.sp,
                fontWeight = FontWeight.Medium
            )

            Text(
                text = category,
                color = if (category == "IFR" || category == "LIFR" || category == "SYNC ERR") Color(0xFFFE0909) else Color.White,
                fontSize = 32.sp,
                fontWeight = FontWeight.Black
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Text(
                text = "TAP TO REFRESH",
                color = Color.DarkGray,
                fontSize = 8.sp,
                fontWeight = FontWeight.Bold
            )

            Text(
                text = "PAIRED: MIAD01",
                color = Color(0xFF22C55E),
                fontSize = 8.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}
