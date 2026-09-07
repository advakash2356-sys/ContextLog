package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.FloatingActionButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.model.PriorityLevel
import com.example.model.TaskCategory
import com.example.model.TaskItem
import com.example.ui.components.AddTaskDialog
import com.example.ui.components.EmptyStateView
import com.example.ui.components.ProgressOverviewCard
import com.example.ui.components.SearchAndFilterSection
import com.example.ui.components.TaskCard
import com.example.ui.theme.MyApplicationTheme
import com.example.viewmodel.MainUiState
import com.example.viewmodel.MainViewModel

class MainActivity : ComponentActivity() {
    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                val uiState by viewModel.uiState.collectAsStateWithLifecycle()
                TaskHubApp(
                    uiState = uiState,
                    onSearchQueryChange = viewModel::updateSearchQuery,
                    onCategorySelect = viewModel::selectCategory,
                    onToggleTask = viewModel::toggleTaskCompletion,
                    onDeleteTask = viewModel::deleteTask,
                    onShowAddTask = viewModel::showAddTaskDialog,
                    onDismissAddTask = viewModel::hideAddTaskDialog,
                    onAddTask = viewModel::addTask
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TaskHubApp(
    uiState: MainUiState,
    onSearchQueryChange: (String) -> Unit,
    onCategorySelect: (TaskCategory) -> Unit,
    onToggleTask: (String) -> Unit,
    onDeleteTask: (String) -> Unit,
    onShowAddTask: () -> Unit,
    onDismissAddTask: () -> Unit,
    onAddTask: (String, String, TaskCategory, PriorityLevel) -> Unit,
    modifier: Modifier = Modifier
) {
    Scaffold(
        modifier = modifier
            .fillMaxSize()
            .testTag("task_hub_scaffold"),
        contentWindowInsets = WindowInsets.safeDrawing,
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.testTag("app_bar_title_row")
                    ) {
                        Icon(
                            imageVector = Icons.Filled.CheckCircle,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(24.dp)
                        )
                        Text(
                            text = stringResource(R.string.app_name),
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                ),
                modifier = Modifier.testTag("app_top_bar")
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onShowAddTask,
                shape = CircleShape,
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = MaterialTheme.colorScheme.onPrimary,
                elevation = FloatingActionButtonDefaults.elevation(defaultElevation = 4.dp),
                modifier = Modifier
                    .testTag("add_task_fab")
                    .windowInsetsPadding(WindowInsets.navigationBars)
            ) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = stringResource(R.string.cd_add_task),
                    modifier = Modifier.size(26.dp)
                )
            }
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .testTag("tasks_lazy_column"),
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 88.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item(key = "progress_section") {
                ProgressOverviewCard(
                    total = uiState.totalCount,
                    completed = uiState.completedCount,
                    pending = uiState.pendingCount,
                    progress = uiState.completionRatio,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
            }

            item(key = "search_filter_section") {
                SearchAndFilterSection(
                    searchQuery = uiState.searchQuery,
                    onSearchQueryChange = onSearchQueryChange,
                    selectedCategory = uiState.selectedCategory,
                    onCategorySelected = onCategorySelect,
                    modifier = Modifier.padding(bottom = 4.dp)
                )
            }

            item(key = "tasks_header") {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = stringResource(R.string.title_tasks),
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "${uiState.filteredTasks.size} ${stringResource(R.string.stat_total).lowercase()}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            if (uiState.filteredTasks.isEmpty()) {
                item(key = "empty_state") {
                    EmptyStateView(isSearching = uiState.searchQuery.isNotBlank() || uiState.selectedCategory != TaskCategory.ALL)
                }
            } else {
                items(
                    items = uiState.filteredTasks,
                    key = { it.id }
                ) { task ->
                    TaskCard(
                        task = task,
                        onToggleCompletion = onToggleTask,
                        onDeleteTask = onDeleteTask
                    )
                }
            }
        }

        if (uiState.isAddTaskDialogVisible) {
            AddTaskDialog(
                onDismiss = onDismissAddTask,
                onConfirm = onAddTask
            )
        }
    }
}

@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    Text(
        text = "Hello $name!",
        modifier = modifier.testTag("greeting_text"),
        style = MaterialTheme.typography.bodyLarge
    )
}

@Preview(showBackground = true)
@Composable
fun TaskHubAppPreview() {
    MyApplicationTheme {
        TaskHubApp(
            uiState = MainUiState(
                tasks = listOf(
                    TaskItem(
                        id = "1",
                        title = "Sample task title",
                        description = "Sample task description",
                        category = TaskCategory.WORK,
                        priority = PriorityLevel.HIGH,
                        isCompleted = false
                    )
                )
            ),
            onSearchQueryChange = {},
            onCategorySelect = {},
            onToggleTask = {},
            onDeleteTask = {},
            onShowAddTask = {},
            onDismissAddTask = {},
            onAddTask = { _, _, _, _ -> }
        )
    }
}
