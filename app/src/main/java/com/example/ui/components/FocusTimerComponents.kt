package com.example.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.FocusTimerStatus
import com.example.ui.theme.Amber80
import com.example.ui.theme.AmberContainerLight
import com.example.ui.theme.PriorityMediumColor
import java.util.Locale

@Composable
fun FocusTimerScreen(
  timerStatus: FocusTimerStatus,
  totalSeconds: Int,
  remainingSeconds: Int,
  completedSessions: Int,
  onStart: () -> Unit,
  onPause: () -> Unit,
  onReset: () -> Unit,
  onSetDuration: (Int) -> Unit,
  modifier: Modifier = Modifier
) {
  val progress = if (totalSeconds > 0) {
    (totalSeconds - remainingSeconds).toFloat() / totalSeconds.toFloat()
  } else 0f

  val animatedProgress by animateFloatAsState(
    targetValue = progress,
    label = "timer_progress"
  )

  val minutes = remainingSeconds / 60
  val seconds = remainingSeconds % 60
  val timeDisplay = String.format(Locale.getDefault(), "%02d:%02d", minutes, seconds)

  val primaryColor = MaterialTheme.colorScheme.primary
  val trackColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)

  Column(
    modifier = modifier
      .fillMaxSize()
      .padding(16.dp),
    horizontalAlignment = Alignment.CenterHorizontally,
    verticalArrangement = Arrangement.spacedBy(20.dp)
  ) {
    // Header & Streak
    Card(
      modifier = Modifier
        .fillMaxWidth()
        .testTag("focus_stats_card"),
      shape = RoundedCornerShape(20.dp),
      colors = CardDefaults.cardColors(
        containerColor = MaterialTheme.colorScheme.tertiaryContainer
      )
    ) {
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(18.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(
          horizontalArrangement = Arrangement.spacedBy(10.dp),
          verticalAlignment = Alignment.CenterVertically
        ) {
          Surface(
            shape = CircleShape,
            color = MaterialTheme.colorScheme.tertiary,
            modifier = Modifier.size(44.dp)
          ) {
            Box(contentAlignment = Alignment.Center) {
              Icon(
                imageVector = Icons.Default.LocalFireDepartment,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onTertiary,
                modifier = Modifier.size(26.dp)
              )
            }
          }
          Column {
            Text(
              text = "Focus Sessions",
              style = MaterialTheme.typography.titleMedium,
              fontWeight = FontWeight.Bold,
              color = MaterialTheme.colorScheme.onTertiaryContainer
            )
            Text(
              text = "$completedSessions completed today",
              style = MaterialTheme.typography.bodyMedium,
              color = MaterialTheme.colorScheme.onTertiaryContainer.copy(alpha = 0.8f)
            )
          }
        }
      }
    }

    // Duration Presets
    Row(
      horizontalArrangement = Arrangement.spacedBy(8.dp),
      modifier = Modifier.testTag("duration_presets_row")
    ) {
      val presets = listOf(15, 25, 45, 60)
      presets.forEach { mins ->
        val isSelected = totalSeconds == mins * 60
        FilterChip(
          selected = isSelected,
          onClick = { onSetDuration(mins) },
          label = { Text("${mins}m") },
          modifier = Modifier.testTag("preset_${mins}m"),
          shape = RoundedCornerShape(12.dp),
          colors = FilterChipDefaults.filterChipColors(
            selectedContainerColor = MaterialTheme.colorScheme.primaryContainer,
            selectedLabelColor = MaterialTheme.colorScheme.onPrimaryContainer
          )
        )
      }
    }

    Spacer(modifier = Modifier.height(10.dp))

    // Circular Timer Gauge
    Box(
      contentAlignment = Alignment.Center,
      modifier = Modifier
        .size(240.dp)
        .testTag("circular_timer_gauge")
    ) {
      Canvas(modifier = Modifier.fillMaxSize()) {
        val strokeWidth = 14.dp.toPx()
        // Background track
        drawCircle(
          color = trackColor,
          style = Stroke(width = strokeWidth)
        )
        // Foreground progress arc
        drawArc(
          color = primaryColor,
          startAngle = -90f,
          sweepAngle = animatedProgress * 360f,
          useCenter = false,
          style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
        )
      }

      Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(4.dp)
      ) {
        Text(
          text = timeDisplay,
          style = MaterialTheme.typography.displayLarge,
          fontWeight = FontWeight.Bold,
          color = MaterialTheme.colorScheme.onSurface,
          modifier = Modifier.testTag("timer_countdown_display")
        )
        Text(
          text = when (timerStatus) {
            FocusTimerStatus.RUNNING -> "Focusing..."
            FocusTimerStatus.PAUSED -> "Paused"
            FocusTimerStatus.COMPLETED -> "Session Complete!"
            FocusTimerStatus.IDLE -> "Ready"
          },
          style = MaterialTheme.typography.labelLarge,
          color = MaterialTheme.colorScheme.primary,
          fontWeight = FontWeight.SemiBold
        )
      }
    }

    Spacer(modifier = Modifier.height(10.dp))

    // Control Buttons
    Row(
      horizontalArrangement = Arrangement.spacedBy(16.dp),
      verticalAlignment = Alignment.CenterVertically
    ) {
      if (timerStatus == FocusTimerStatus.RUNNING) {
        Button(
          onClick = onPause,
          shape = CircleShape,
          modifier = Modifier
            .size(64.dp)
            .testTag("pause_timer_button"),
          colors = ButtonDefaults.buttonColors(
            containerColor = MaterialTheme.colorScheme.secondary
          )
        ) {
          Icon(
            imageVector = Icons.Default.Pause,
            contentDescription = "Pause Timer",
            modifier = Modifier.size(28.dp)
          )
        }
      } else {
        Button(
          onClick = onStart,
          shape = CircleShape,
          modifier = Modifier
            .size(64.dp)
            .testTag("start_timer_button"),
          colors = ButtonDefaults.buttonColors(
            containerColor = MaterialTheme.colorScheme.primary
          )
        ) {
          Icon(
            imageVector = Icons.Default.PlayArrow,
            contentDescription = "Start Timer",
            modifier = Modifier.size(28.dp)
          )
        }
      }

      OutlinedButton(
        onClick = onReset,
        shape = CircleShape,
        modifier = Modifier
          .size(64.dp)
          .testTag("reset_timer_button")
      ) {
        Icon(
          imageVector = Icons.Default.Refresh,
          contentDescription = "Reset Timer",
          tint = MaterialTheme.colorScheme.onSurfaceVariant,
          modifier = Modifier.size(26.dp)
        )
      }
    }
  }
}
