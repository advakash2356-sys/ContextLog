package com.example.model

enum class TaskCategory(val displayName: String) {
    ALL("All"),
    WORK("Work"),
    PERSONAL("Personal"),
    STUDY("Study"),
    HEALTH("Health")
}

enum class PriorityLevel(val label: String) {
    HIGH("High"),
    MEDIUM("Medium"),
    LOW("Low")
}

data class TaskItem(
    val id: String,
    val title: String,
    val description: String = "",
    val category: TaskCategory = TaskCategory.WORK,
    val priority: PriorityLevel = PriorityLevel.MEDIUM,
    val isCompleted: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)
