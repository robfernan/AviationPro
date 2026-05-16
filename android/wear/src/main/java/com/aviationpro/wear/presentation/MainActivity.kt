package com.aviationpro.wear.presentation

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material3.Text
import androidx.wear.compose.ui.tooling.preview.WearPreviewDevices
import com.aviationpro.wear.R
import com.aviationpro.wear.presentation.theme.AndroidTheme
import java.time.LocalTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import kotlinx.coroutines.delay
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AVPROWatchPreview()
        }
    }
}

@Composable
fun AVPROWatchPreview() {
    var time by remember { mutableStateOf(LocalTime.now()) }
    val zuluTime by remember { 
        derivedStateOf { LocalTime.now(ZoneId.of("UTC")) } 
    }

    LaunchedEffect(Unit) {
        while (true) {
            time = LocalTime.now()
            delay(1000)
        }
    }

    AndroidTheme {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black),
            contentAlignment = Alignment.Center
        ) {
            // 1. Static Markings (Ticks)
            WatchTicks()

            // 2. Zulu Time (Top)
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.offset(y = (-60).dp)
            ) {
                Text(
                    text = "ZULU",
                    color = Color.Gray,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = zuluTime.format(DateTimeFormatter.ofPattern("HH:mm")),
                    color = Color(0xFFFE0909), // Your AVPRO Red
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Black
                )
            }

            // 3. Complication Slot (SmallBox)
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(Color(0xFF1A1A1A))
                    .padding(2.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = stringResource(R.string.weather_placeholder),
                    color = Color.White,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            // 4. Local Time (Bottom)
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.offset(y = 65.dp)
            ) {
                Text(
                    text = time.format(DateTimeFormatter.ofPattern("HH:mm")),
                    color = Color.White,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "LOCAL",
                    color = Color.Gray,
                    fontSize = 8.sp
                )
            }

            // 5. Analog Hands
            AnalogHands(time)
        }
    }
}

@Composable
fun WatchTicks() {
    Canvas(modifier = Modifier.fillMaxSize()) {
        val inset = 10.dp.toPx()
        for (i in 0 until 12) {
            val angle = i * 30f * (PI / 180f)
            val start = Offset(
                x = center.x + (size.minDimension / 2 - inset) * cos(angle).toFloat(),
                y = center.y + (size.minDimension / 2 - inset) * sin(angle).toFloat()
            )
            val end = Offset(
                x = center.x + (size.minDimension / 2) * cos(angle).toFloat(),
                y = center.y + (size.minDimension / 2) * sin(angle).toFloat()
            )
            drawLine(Color.White, start, end, strokeWidth = 2.dp.toPx())
        }
    }
}

@Composable
fun AnalogHands(time: LocalTime) {
    Canvas(modifier = Modifier.fillMaxSize()) {
        val hourAngle = (time.hour % 12 + time.minute / 60f) * 30f
        val minuteAngle = time.minute * 6f
        val secondAngle = time.second * 6f

        // Hour Hand
        rotate(hourAngle) {
            drawLine(
                color = Color.White,
                start = center,
                end = center.copy(y = center.y - 50.dp.toPx()),
                strokeWidth = 4.dp.toPx(),
                cap = StrokeCap.Round
            )
        }

        // Minute Hand
        rotate(minuteAngle) {
            drawLine(
                color = Color.White,
                start = center,
                end = center.copy(y = center.y - 80.dp.toPx()),
                strokeWidth = 3.dp.toPx(),
                cap = StrokeCap.Round
            )
        }

        // Second Hand (AVPRO Red)
        rotate(secondAngle) {
            drawLine(
                color = Color(0xFFFE0909),
                start = center,
                end = center.copy(y = center.y - 90.dp.toPx()),
                strokeWidth = 1.5.dp.toPx(),
                cap = StrokeCap.Round
            )
        }
        
        // Center Pin
        drawCircle(Color.White, radius = 4.dp.toPx())
    }
}

@WearPreviewDevices
@Composable
fun WatchPreview() {
    AVPROWatchPreview()
}
