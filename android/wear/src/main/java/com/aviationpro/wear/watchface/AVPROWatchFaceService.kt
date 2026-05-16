package com.aviationpro.wear.watchface

import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Rect
import android.view.SurfaceHolder
import androidx.wear.watchface.CanvasType
import androidx.wear.watchface.ComplicationSlotsManager
import androidx.wear.watchface.Renderer
import androidx.wear.watchface.WatchFace
import androidx.wear.watchface.WatchFaceService
import androidx.wear.watchface.WatchFaceType
import androidx.wear.watchface.WatchState
import androidx.wear.watchface.style.CurrentUserStyleRepository
import java.time.Instant
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

/**
 * AVPRO // AVIATOR_DIGITAL_WATCH_FACE
 * SIMPLE, HIGH-CONTRAST, ZULU-FIRST DESIGN
 */
class AVPROWatchFaceService : WatchFaceService() {

    override suspend fun createWatchFace(
        surfaceHolder: SurfaceHolder,
        watchState: WatchState,
        complicationSlotsManager: ComplicationSlotsManager,
        currentUserStyleRepository: CurrentUserStyleRepository
    ): WatchFace {
        return WatchFace(
            watchFaceType = WatchFaceType.DIGITAL,
            renderer = AVPRORenderer(
                surfaceHolder,
                watchState,
                complicationSlotsManager,
                currentUserStyleRepository,
                CanvasType.SOFTWARE
            )
        )
    }

    private class AVPRORenderer(
        surfaceHolder: SurfaceHolder,
        watchState: WatchState,
        complicationSlotsManager: ComplicationSlotsManager,
        currentUserStyleRepository: CurrentUserStyleRepository,
        canvasType: Int
    ) : Renderer.CanvasRenderer2<Renderer.SharedAssets>(
        surfaceHolder,
        currentUserStyleRepository,
        watchState,
        canvasType,
        16L, // 1 fps refresh is enough for a simple digital face
        false // clearWithBackgroundTintBeforeRenderingHighlightLayer
    ) {
        private val zuluPaint = Paint().apply {
            color = Color.parseColor("#DC2626") // AVPRO Red
            isAntiAlias = true
            textAlign = Paint.Align.CENTER
            textSize = 80f
            isFakeBoldText = true
        }

        private val localPaint = Paint().apply {
            color = Color.parseColor("#F4F4F5") // White
            isAntiAlias = true
            textAlign = Paint.Align.CENTER
            textSize = 40f
        }

        private val labelPaint = Paint().apply {
            color = Color.parseColor("#71717A") // Muted Zinc
            isAntiAlias = true
            textAlign = Paint.Align.CENTER
            textSize = 24f
            letterSpacing = 0.2f
        }

        override fun render(canvas: Canvas, bounds: Rect, zonedDateTime: ZonedDateTime, sharedAssets: Renderer.SharedAssets) {
            canvas.drawColor(Color.BLACK)

            val centerX = bounds.centerX().toFloat()
            val centerY = bounds.centerY().toFloat()

            // 1. Draw Zulu Time (UTC)
            val now = Instant.now()
            val zuluTime = ZonedDateTime.ofInstant(now, ZoneId.of("UTC"))
            val zuluString = zuluTime.format(DateTimeFormatter.ofPattern("HH:mm"))
            
            canvas.drawText("ZULU", centerX, centerY - 100f, labelPaint)
            canvas.drawText(zuluString, centerX, centerY - 20f, zuluPaint)

            // 2. Draw Local Time
            val localString = zonedDateTime.format(DateTimeFormatter.ofPattern("HH:mm"))
            canvas.drawText("LOCAL", centerX, centerY + 60f, labelPaint)
            canvas.drawText(localString, centerX, centerY + 110f, localPaint)
            
            // 3. Draw Date
            val dateString = zonedDateTime.format(DateTimeFormatter.ofPattern("EEE, MMM dd")).uppercase()
            canvas.drawText(dateString, centerX, centerY + 160f, labelPaint)
        }

        override fun renderHighlightLayer(canvas: Canvas, bounds: Rect, zonedDateTime: ZonedDateTime, sharedAssets: Renderer.SharedAssets) {
            // Not needed for simple face
        }

        override suspend fun createSharedAssets(): Renderer.SharedAssets {
            return object : Renderer.SharedAssets {
                override fun onDestroy() {}
            }
        }
    }
}
