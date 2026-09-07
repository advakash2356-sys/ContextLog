package com.example.ui.components

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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.HourglassTop
import androidx.compose.material.icons.filled.ListAlt
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.data.TaskCategory
import com.example.data.TaskEntity

@Composable
fun InsightsScreen(
  tasks: List<TaskEntity>,
  completedSessions: Int,
  modifier: Modifier = Modifier
) {
  val totalTasks = tasks.size
  val completedTasks = tasks.count { it.isCompleted }
  val pendingTasks = totalTasks - completedTasks
  val rate = if (totalTasks > 0) (completedTasks.toFloat() / totalTasks.toFloat() * 100).toInt() else 0

  LazyColumn(
    modifier = modifier
      .fillMaxSize()
      .padding(16.dp)
      .testTag("insights_screen_column"),
    verticalArrangement = Arrangement.spacedBy(16.dp)
  ) {
    item {
      // Motivational Spark Card
      Card(
        modifier = Modifier
          .fillMaxWidth()
          .testTag("daily_spark_motivation_card"),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
          containerColor = MaterialTheme.colorScheme.primaryContainer
        )
      ) {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(18.dp),
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(14.dp)
        ) {
          Surface(
            shape = CircleShape,
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(48.dp)
          ) {
            Box(contentAlignment = Alignment.Center) {
              Icon(
                imageVector = Icons.Default.AutoAwesome,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onPrimary,
                modifier = Modifier.size(24.dp)
              )
            }
          }
          Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Text(
              text = if (rate >= 80) "Outstanding Momentum!" else if (rate >= 50) "Great Progress Today!" else "Keep Going, Spark!",
              style = MaterialTheme.typography.titleMedium,
              fontWeight = FontWeight.Bold,
              color = MaterialTheme.colorScheme.onPrimaryContainer
            )
            Text(
              text = "You have finished $completedTasks tasks and logged $completedSessions focus blocks.",
              style = MaterialTheme.typography.bodyMedium,
              color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.85f)
            )
          }
        }
      }
    }

    item {
      // 3 Stat Grid
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp)
      ) {
        StatTile(
          icon = Icons.Default.ListAlt,
          title = "Total",
          value = "$totalTasks",
          containerColor = MaterialTheme.colorScheme.surfaceVariant,
          modifier = Modifier.weight(1f)
        )
        StatTile(
          icon = Icons.Default.CheckCircle,
          title = "Done",
          value = "$completedTasks",
          containerColor = MaterialTheme.colorScheme.secondaryContainer,
          modifier = Modifier.weight(1f)
        )
        StatTile(
          icon = Icons.Default.HourglassTop,
          title = "Pending",
          value = "$pendingTasks",
          containerColor = MaterialTheme.colorScheme.tertiaryContainer,
          modifier = Modifier.weight(1f)
        )
      }
    }

    item {
      // Category Breakdown Card
      Card(
        modifier = Modifier
          .fillMaxWidth()
          .testTag("category_breakdown_card"),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
      ) {
        Column(
          modifier = Modifier.padding(18.dp),
          verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
          Text(
            text = "Category Distribution",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
          )

          val categories = TaskCategory.entries.filter { it != TaskCategory.ALL }
          categories.forEach { cat ->
            val count = tasks.count { it.category.equals(cat.name, ignoreCase = true) }
            val catProgress = if (totalTasks > 0) count.toFloat() / totalTasks.toFloat() else 0f

            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
              ) {
                Text(
                  text = cat.name.lowercase().replaceFirstChar { it.uppercase() },
                  style = MaterialTheme.typography.bodyMedium
                )
                Text(
                  text = "$count tasks",
                  style = MaterialTheme.typography.labelMedium,
                  fontWeight = FontWeight.SemiBold
                )
              }
              LinearProgressIndicator(
                progress = { catProgress },
                modifier = Modifier
                  .fillMaxWidth()
                  .height(6.dp)
                  .clip(RoundedCornerShape(3.dp)),
                color = MaterialTheme.colorScheme.primary,
                trackColor = MaterialTheme.colorScheme.surfaceVariant
              )
            }
          }
        }
      }
    }
  }
}

@Composable
private fun StatTile(
  icon: ImageVector,
  title: String,
  value: String,
  containerColor: Color,
  modifier: Modifier = Modifier
) {
  Card(
    modifier = modifier,
    shape = RoundedCornerShape(16.dp),
    colors = CardDefaults.cardColors(containerColor = containerColor)
  ) {
    Column(
      modifier = Modifier.padding(12.dp),
      verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
      Icon(
        imageVector = icon,
        contentDescription = null,
        modifier = Modifier.size(20.dp)
      )
      Text(
        text = value,
        style = MaterialTheme.typography.titleLarge,
        fontWeight = FontWeight.Bold
      )
      Text(
        text = title,
        style = MaterialTheme.typography.labelSmall
      )
    }
  }
}
