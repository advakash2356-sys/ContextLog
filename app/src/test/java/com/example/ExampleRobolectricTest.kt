package com.example

import android.app.Application
import androidx.test.core.app.ApplicationProvider
import com.example.model.PriorityLevel
import com.example.model.TaskCategory
import com.example.viewmodel.MainViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class ExampleRobolectricTest {

    private lateinit var context: Application
    private lateinit var viewModel: MainViewModel

    @Before
    fun setUp() {
        context = ApplicationProvider.getApplicationContext()
        viewModel = MainViewModel()
    }

    @Test
    fun testStringResourcesMatch() {
        val appName = context.getString(R.string.app_name)
        assertEquals("Task & Focus Hub", appName)

        val subtitle = context.getString(R.string.app_subtitle)
        assertEquals("Stay organized and productive", subtitle)
    }

    @Test
    fun testInitialState() {
        val state = viewModel.uiState.value
        assertNotNull(state.tasks)
        assertTrue(state.tasks.isNotEmpty())
        assertEquals(TaskCategory.ALL, state.selectedCategory)
        assertEquals("", state.searchQuery)
        assertFalse(state.isAddTaskDialogVisible)
    }

    @Test
    fun testAddTask() {
        val initialCount = viewModel.uiState.value.totalCount
        viewModel.addTask(
            title = "Test New Task",
            description = "Test Description",
            category = TaskCategory.STUDY,
            priority = PriorityLevel.HIGH
        )
        val updatedState = viewModel.uiState.value
        assertEquals(initialCount + 1, updatedState.totalCount)
        val addedTask = updatedState.tasks.first()
        assertEquals("Test New Task", addedTask.title)
        assertEquals(TaskCategory.STUDY, addedTask.category)
        assertEquals(PriorityLevel.HIGH, addedTask.priority)
        assertFalse(addedTask.isCompleted)
    }

    @Test
    fun testToggleTaskCompletion() {
        val task = viewModel.uiState.value.tasks.first()
        val initialCompletion = task.isCompleted
        viewModel.toggleTaskCompletion(task.id)
        val toggledTask = viewModel.uiState.value.tasks.first { it.id == task.id }
        assertEquals(!initialCompletion, toggledTask.isCompleted)
    }

    @Test
    fun testDeleteTask() {
        val initialTasks = viewModel.uiState.value.tasks
        val targetTask = initialTasks.first()
        viewModel.deleteTask(targetTask.id)
        val updatedTasks = viewModel.uiState.value.tasks
        assertEquals(initialTasks.size - 1, updatedTasks.size)
        assertFalse(updatedTasks.any { it.id == targetTask.id })
    }

    @Test
    fun testSearchFiltering() {
        viewModel.updateSearchQuery("Workout")
        val state = viewModel.uiState.value
        assertTrue(state.filteredTasks.all { it.title.contains("Workout", ignoreCase = true) || it.description.contains("Workout", ignoreCase = true) })
    }

    @Test
    fun testCategoryFiltering() {
        viewModel.selectCategory(TaskCategory.WORK)
        val state = viewModel.uiState.value
        assertTrue(state.filteredTasks.all { it.category == TaskCategory.WORK })
    }

    @Test
    fun testDialogVisibility() {
        viewModel.showAddTaskDialog()
        assertTrue(viewModel.uiState.value.isAddTaskDialogVisible)
        viewModel.hideAddTaskDialog()
        assertFalse(viewModel.uiState.value.isAddTaskDialogVisible)
    }
}
