package com.example.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.model.PriorityLevel
import com.example.model.TaskCategory
import com.example.model.TaskItem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import java.util.UUID

data class MainUiState(
    val tasks: List<TaskItem> = emptyList(),
    val searchQuery: String = "",
    val selectedCategory: TaskCategory = TaskCategory.ALL,
    val isAddTaskDialogVisible: Boolean = false
) {
    val filteredTasks: List<TaskItem>
        get() = tasks.filter { task ->
            val matchesCategory = (selectedCategory == TaskCategory.ALL) || (task.category == selectedCategory)
            val matchesSearch = searchQuery.isBlank() ||
                    task.title.contains(searchQuery, ignoreCase = true) ||
                    task.description.contains(searchQuery, ignoreCase = true)
            matchesCategory && matchesSearch
        }

    val totalCount: Int get() = tasks.size
    val completedCount: Int get() = tasks.count { it.isCompleted }
    val pendingCount: Int get() = totalCount - completedCount
    val completionRatio: Float
        get() = if (totalCount == 0) 0f else completedCount.toFloat() / totalCount
}

class MainViewModel : ViewModel() {

    private val _tasks = MutableStateFlow<List<TaskItem>>(
        listOf(
            TaskItem(
                id = UUID.randomUUID().toString(),
                title = "Design System Architecture",
                description = "Define typography, tokens, and Material 3 theme palette for Jetpack Compose.",
                category = TaskCategory.WORK,
                priority = PriorityLevel.HIGH,
                isCompleted = true
            ),
            TaskItem(
                id = UUID.randomUUID().toString(),
                title = "Morning Workout & Hydration",
                description = "45 mins cardio session and drinking 1L water.",
                category = TaskCategory.HEALTH,
                priority = PriorityLevel.MEDIUM,
                isCompleted = false
            ),
            TaskItem(
                id = UUID.randomUUID().toString(),
                title = "Kotlin Coroutines & Flow Deep Dive",
                description = "Review structured concurrency, channels, and stateful flows.",
                category = TaskCategory.STUDY,
                priority = PriorityLevel.HIGH,
                isCompleted = false
            ),
            TaskItem(
                id = UUID.randomUUID().toString(),
                title = "Grocery Shopping & Meal Prep",
                description = "Fresh vegetables, proteins, and pantry essentials.",
                category = TaskCategory.PERSONAL,
                priority = PriorityLevel.LOW,
                isCompleted = false
            )
        )
    )

    private val _searchQuery = MutableStateFlow("")
    private val _selectedCategory = MutableStateFlow(TaskCategory.ALL)
    private val _isAddTaskDialogVisible = MutableStateFlow(false)

    val uiState: StateFlow<MainUiState> = combine(
        _tasks,
        _searchQuery,
        _selectedCategory,
        _isAddTaskDialogVisible
    ) { tasks, query, category, isDialogVisible ->
        MainUiState(
            tasks = tasks,
            searchQuery = query,
            selectedCategory = category,
            isAddTaskDialogVisible = isDialogVisible
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = MainUiState(tasks = _tasks.value)
    )

    fun updateSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun selectCategory(category: TaskCategory) {
        _selectedCategory.value = category
    }

    fun showAddTaskDialog() {
        _isAddTaskDialogVisible.value = true
    }

    fun hideAddTaskDialog() {
        _isAddTaskDialogVisible.value = false
    }

    fun addTask(
        title: String,
        description: String,
        category: TaskCategory,
        priority: PriorityLevel
    ) {
        if (title.isBlank()) return
        val newTask = TaskItem(
            id = UUID.randomUUID().toString(),
            title = title.trim(),
            description = description.trim(),
            category = category,
            priority = priority,
            isCompleted = false
        )
        _tasks.update { listOf(newTask) + it }
        hideAddTaskDialog()
    }

    fun toggleTaskCompletion(taskId: String) {
        _tasks.update { currentList ->
            currentList.map { task ->
                if (task.id == taskId) {
                    task.copy(isCompleted = !task.isCompleted)
                } else {
                    task
                }
            }
        }
    }

    fun deleteTask(taskId: String) {
        _tasks.update { currentList ->
            currentList.filterNot { it.id == taskId }
        }
    }
}
