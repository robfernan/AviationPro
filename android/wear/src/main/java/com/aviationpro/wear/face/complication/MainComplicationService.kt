package com.aviationpro.wear.face.complication

import android.util.Log
import androidx.wear.watchface.complications.data.ComplicationData
import androidx.wear.watchface.complications.data.ComplicationType
import androidx.wear.watchface.complications.data.PlainComplicationText
import androidx.wear.watchface.complications.data.ShortTextComplicationData
import androidx.wear.watchface.complications.datasource.ComplicationRequest
import androidx.wear.watchface.complications.datasource.SuspendingComplicationDataSourceService
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.Wearable
import kotlinx.coroutines.tasks.await

class MainComplicationService : SuspendingComplicationDataSourceService() {

    override fun getPreviewData(type: ComplicationType): ComplicationData? {
        if (type != ComplicationType.SHORT_TEXT) return null
        return createComplicationData("VFR", "Flight Category")
    }

    override suspend fun onComplicationRequest(request: ComplicationRequest): ComplicationData {
        var category = "N/A"
        Log.d("AVPRO", "Complication request received")

        try {
            val dataClient = Wearable.getDataClient(this)
            val dataItems = dataClient.dataItems.await()
            Log.d("AVPRO", "Found ${dataItems.count} data items")
            for (item in dataItems) {
                if (item.uri.path == "/weather") {
                    category = DataMapItem.fromDataItem(item).dataMap.getString("category", "VFR")
                    Log.d("AVPRO", "Found weather category: $category")
                }
            }
        } catch (e: Exception) {
            Log.e("AVPRO", "Failed to fetch weather for complication", e)
        }

        return createComplicationData(category, "Weather: $category")
    }

    private fun createComplicationData(text: String, contentDescription: String) =
        ShortTextComplicationData.Builder(
            text = PlainComplicationText.Builder(text).build(),
            contentDescription = PlainComplicationText.Builder(contentDescription).build()
        ).build()
}