package com.aviationpro.wear.face.presentation

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
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

    private var metarCategory by mutableStateOf("FETCHING...")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initial fetch of data
        Wearable.getDataClient(this).dataItems.addOnSuccessListener { dataItems ->
            for (item in dataItems) {
                if (item.uri.path == "/weather") {
                    metarCategory = DataMapItem.fromDataItem(item).dataMap.getString("category", "VFR")
                }
            }
        }

        setContent {
            WatchAppScreen(metarCategory)
        }
    }

    override fun onResume() {
        super.onResume()
        Wearable.getDataClient(this).addListener(this)
    }

    override fun onPause() {
        super.onPause()
        Wearable.getDataClient(this).removeListener(this)
    }

    override fun onDataChanged(dataEvents: DataEventBuffer) {
        for (event in dataEvents) {
            if (event.dataItem.uri.path == "/weather") {
                metarCategory = DataMapItem.fromDataItem(event.dataItem).dataMap.getString("category", "VFR")
            }
        }
    }
}

@Composable
fun WatchAppScreen(category: String) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black),
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
                color = if (category == "IFR" || category == "LIFR") Color(0xFFFE0909) else Color.White,
                fontSize = 36.sp,
                fontWeight = FontWeight.Black
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Text(
                text = "SYNCED WITH MIAD01",
                color = Color(0xFF22C55E),
                fontSize = 8.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}
