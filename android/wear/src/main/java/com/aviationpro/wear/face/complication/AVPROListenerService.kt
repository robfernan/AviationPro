package com.aviationpro.wear.face.complication

import android.content.ComponentName
import android.content.Context
import androidx.wear.watchface.complications.datasource.ComplicationDataSourceUpdateRequester
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.WearableListenerService

class AVPROListenerService : WearableListenerService() {
    override fun onDataChanged(dataEvents: DataEventBuffer) {
        val context: Context = this
        val componentName = ComponentName(context, MainComplicationService::class.java)
        val requester = ComplicationDataSourceUpdateRequester.create(context, componentName)
        requester.requestUpdateAll()
    }
}