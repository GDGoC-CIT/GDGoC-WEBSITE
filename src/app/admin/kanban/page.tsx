'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { db, Task, User, mockTeam } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Plus, Calendar, AlertCircle, Tag, MoreHorizontal, CheckCircle2, 
  Trash2, X, PlusCircle, MessageSquare, Clipboard, Star 
} from 'lucide-react';

const COLUMNS: { id: Task['status']; label: string; dot: string }[] = [
  { id: 'backlog', label: 'Backlog', dot: 'bg-gdg-blue' },
  { id: 'in_progress', label: 'In Progress', dot: 'bg-gdg-yellow' },
  { id: 'review', label: 'Review', dot: 'bg-gdg-red' },
  { id: 'done', label: 'Done', dot: 'bg-gdg-green' }
];

export default function KanbanPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Kanban Data
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Task Details Modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState<Record<string, string[]>>({
    'task-3': ['Database schema approved by CIT staff.', 'Migration runs complete.'],
    'task-1': ['Room bookings confirmed with Block 3 office.']
  });

  // Create Task Form State
  const [createOpen, setCreateOpen] = useState(false);
  const [createColumn, setCreateColumn] = useState<Task['status']>('backlog');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium');
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>('2');
  const [newTaskDue, setNewTaskDue] = useState('');
  const [newTaskTag, setNewTaskTag] = useState('');
  const [newTaskTags, setNewTaskTags] = useState<string[]>(['Tech']);

  useEffect(() => {
    if (authLoading) return;
    if (!user || (user.role !== 'member' && user.role !== 'admin')) {
      router.push('/auth/signin?error=AccessDenied');
      return;
    }

    async function loadTasks() {
      try {
        const data = await db.getTasks();
        setTasks(data);
      } catch (err) {
        console.error("Failed to load tasks:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, [user, authLoading, router]);

  // DRAG AND DROP HANDLERS (HTML5 Drag APIs)
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: Task['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    // Update state locally
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, status: targetStatus, updated_at: new Date().toISOString() };
      }
      return t;
    });
    setTasks(updatedTasks);

    // Save to Database
    try {
      await db.updateTask(taskId, { status: targetStatus });
    } catch (err) {
      console.error("Failed to update status on drag and drop:", err);
    }
  };

  // ADD TASK FLOW
  const handleOpenCreate = (col: Task['status']) => {
    setCreateColumn(col);
    setCreateOpen(true);
  };

  const handleAddTaskTag = () => {
    if (!newTaskTag.trim()) return;
    if (!newTaskTags.includes(newTaskTag.trim())) {
      setNewTaskTags([...newTaskTags, newTaskTag.trim()]);
    }
    setNewTaskTag('');
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const newTask = await db.createTask({
        title: newTaskTitle,
        description: newTaskDesc,
        status: createColumn,
        priority: newTaskPriority,
        assignee_id: newTaskAssignee,
        due_date: newTaskDue || undefined,
        tags: newTaskTags,
        position: tasks.filter(t => t.status === createColumn).length
      });

      setTasks([...tasks, newTask]);
      
      // Reset
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskPriority('medium');
      setNewTaskAssignee('2');
      setNewTaskDue('');
      setNewTaskTags(['Tech']);
      setCreateOpen(false);
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  // EDIT / DETAIL MODAL FLOW
  const handleCardClick = (task: Task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const handleUpdateTaskDetail = async (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    setSelectedTask(updatedTask);
    try {
      await db.updateTask(updatedTask.id, updatedTask);
    } catch (err) {
      console.error("Failed to save task edits:", err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    setModalOpen(false);
    setSelectedTask(null);
    try {
      await db.deleteTask(taskId);
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const handleAddComment = () => {
    if (!commentInput.trim() || !selectedTask) return;
    const taskComments = comments[selectedTask.id] || [];
    setComments({
      ...comments,
      [selectedTask.id]: [...taskComments, commentInput.trim()]
    });
    setCommentInput('');
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gdg-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Loading chapter task board...</p>
          </div>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-gdg-red border-red-200';
      case 'medium': return 'bg-yellow-50 text-gdg-yellow border-yellow-250';
      default: return 'bg-green-50 text-gdg-green border-green-200';
    }
  };

  const getAssigneeAvatar = (assigneeId?: string) => {
    const member = mockTeam.find(m => m.id === assigneeId);
    return member ? member.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100';
  };

  const getAssigneeName = (assigneeId?: string) => {
    const member = mockTeam.find(m => m.id === assigneeId);
    return member ? member.name : 'Unassigned';
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 p-6 flex flex-col w-full max-w-[1600px] mx-auto overflow-hidden">
        
        {/* Title / Action bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 font-display tracking-tight flex items-center">
              <Clipboard className="w-6 h-6 mr-2.5 text-gdg-blue" />
              Chapter Operations Kanban
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Drag-and-drop tasks to sync project tracks. Accessible for certified board members and chapter leads.
            </p>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => handleOpenCreate('backlog')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold rounded-full text-white bg-gdg-blue hover:bg-blue-700 transition-material elevation-1 cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Operations Task
            </button>
          </div>
        </div>

        {/* Kanban Board columns container */}
        <div className="flex-1 overflow-x-auto pb-4 flex space-x-6 min-h-[60vh] items-stretch">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter(t => t.status === col.id);

            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className="w-80 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col flex-shrink-0"
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white rounded-t-2xl">
                  <div className="flex items-center space-x-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                    <span className="text-sm font-bold text-gray-800 tracking-wide">{col.label}</span>
                    <span className="bg-gray-100 text-gray-550 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => handleOpenCreate(col.id)}
                    className="p-1 text-gray-400 hover:text-gdg-blue hover:bg-gray-50 rounded-lg transition-material cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Cards Container */}
                <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                  {colTasks.length > 0 ? (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => handleCardClick(task)}
                        className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:elevation-2 transition-material cursor-grab active:cursor-grabbing group"
                      >
                        {/* Priorities & edit dots */}
                        <div className="flex justify-between items-center mb-3">
                          <span className={`inline-block border px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400 tracking-wide">
                            {task.id.toUpperCase()}
                          </span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-gdg-blue transition-material leading-snug line-clamp-2">
                          {task.title}
                        </h4>

                        {task.description && (
                          <p className="text-[11px] text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Date and tags bar */}
                        <div className="mt-4 pt-3.5 border-t border-gray-100 flex flex-wrap gap-1.5">
                          {task.tags.map((tag, i) => (
                            <span key={i} className="bg-gray-100 text-gray-550 text-[9px] font-bold px-2 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Assignee & Comments metadata */}
                        <div className="mt-4 flex justify-between items-center">
                          {task.due_date ? (
                            <span className="inline-flex items-center text-[10px] font-bold text-gray-400">
                              <Calendar className="w-3.5 h-3.5 mr-1" />
                              {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          ) : (
                            <span />
                          )}

                          <div className="flex items-center space-x-3">
                            {comments[task.id] && (
                              <span className="flex items-center text-[10px] font-bold text-gray-400">
                                <MessageSquare className="w-3 h-3 mr-1 text-gray-400" />
                                {comments[task.id].length}
                              </span>
                            )}
                            <img
                              src={getAssigneeAvatar(task.assignee_id)}
                              alt="Assignee"
                              className="w-6 h-6 rounded-full border border-white object-cover"
                              title={`Assigned to: ${getAssigneeName(task.assignee_id)}`}
                            />
                          </div>
                        </div>

                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
                      <p className="text-xs text-gray-400 font-medium">Empty column</p>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* Modal: Create Task */}
        {createOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-150 flex items-center justify-between">
                <h3 className="text-base font-extrabold text-gray-850 font-display">Create Operations Task</h3>
                <button onClick={() => setCreateOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Task Title</label>
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Enter short, actionable title..."
                    className="w-full px-4 py-2 border border-gray-250 rounded-xl text-sm focus:outline-none focus:border-gdg-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Description (Markdown)</label>
                  <textarea
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    placeholder="Describe task expectations..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-250 rounded-xl text-sm focus:outline-none focus:border-gdg-blue"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Priority</label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as Task['priority'])}
                      className="w-full px-3 py-2 border border-gray-250 rounded-xl text-xs focus:outline-none focus:border-gdg-blue"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Assignee</label>
                    <select
                      value={newTaskAssignee}
                      onChange={(e) => setNewTaskAssignee(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-250 rounded-xl text-xs focus:outline-none focus:border-gdg-blue"
                    >
                      {mockTeam.map(member => (
                        <option key={member.id} value={member.id}>{member.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Due Date</label>
                    <input
                      type="date"
                      value={newTaskDue}
                      onChange={(e) => setNewTaskDue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-250 rounded-xl text-xs focus:outline-none focus:border-gdg-blue text-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tags (add tag)</label>
                    <div className="flex space-x-1.5">
                      <input
                        type="text"
                        value={newTaskTag}
                        onChange={(e) => setNewTaskTag(e.target.value)}
                        placeholder="Tag name"
                        className="flex-1 px-3 py-1.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:border-gdg-blue"
                      />
                      <button
                        type="button"
                        onClick={handleAddTaskTag}
                        className="px-2.5 py-1.5 bg-gray-100 border border-gray-250 rounded-xl text-xs font-bold hover:bg-gray-200 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Display tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {newTaskTags.map(tag => (
                    <span key={tag} className="inline-flex items-center bg-blue-50 text-gdg-blue border border-blue-150 px-2.5 py-0.5 rounded text-[10px] font-bold">
                      {tag}
                      <button
                        type="button"
                        onClick={() => setNewTaskTags(newTaskTags.filter(t => t !== tag))}
                        className="ml-1 text-[10px] font-extrabold text-red-500"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-150 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setCreateOpen(false)}
                    className="px-4 py-2 border border-gray-250 hover:bg-gray-50 rounded-full text-xs font-bold text-gray-600 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gdg-blue hover:bg-blue-700 text-white rounded-full text-xs font-bold elevation-1 cursor-pointer"
                  >
                    Save Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Task Detail */}
        {modalOpen && selectedTask && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="p-6 border-b border-gray-150 flex items-center justify-between bg-gray-50 rounded-t-2xl">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Task Details &bull; {selectedTask.id.toUpperCase()}</span>
                  <h3 className="text-base font-extrabold text-gray-900 mt-1 font-display">{selectedTask.title}</h3>
                </div>
                <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Details edit left side */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                    <p className="text-xs text-gray-650 bg-gray-50 p-4 rounded-xl border border-gray-200 whitespace-pre-line leading-relaxed">
                      {selectedTask.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Comments list */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1 text-gray-450" />
                      Operations Comments Thread
                    </h4>
                    
                    <div className="space-y-2.5 max-h-48 overflow-y-auto mb-3">
                      {(comments[selectedTask.id] || []).map((comm, idx) => (
                        <div key={idx} className="bg-gray-50 border border-gray-200 p-3 rounded-xl">
                          <p className="text-xs text-gray-700 leading-normal">{comm}</p>
                          <span className="block text-[9px] text-gray-400 mt-1 font-semibold">Organizing Committee Coord</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="Add comment..."
                        className="flex-1 px-3 py-2 border border-gray-250 rounded-xl text-xs focus:outline-none focus:border-gdg-blue"
                      />
                      <button
                        onClick={handleAddComment}
                        className="px-3.5 py-2 bg-gdg-blue text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right side parameters panel */}
                <div className="space-y-6">
                  <div>
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Priority</span>
                    <select
                      value={selectedTask.priority}
                      onChange={(e) => handleUpdateTaskDetail({ ...selectedTask, priority: e.target.value as Task['priority'] })}
                      className="w-full px-3 py-1.5 border border-gray-250 rounded-xl text-xs focus:outline-none text-gray-750"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>

                  <div>
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Assignee</span>
                    <select
                      value={selectedTask.assignee_id}
                      onChange={(e) => handleUpdateTaskDetail({ ...selectedTask, assignee_id: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-250 rounded-xl text-xs focus:outline-none text-gray-750"
                    >
                      {mockTeam.map(member => (
                        <option key={member.id} value={member.id}>{member.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Due Date</span>
                    <input
                      type="date"
                      value={selectedTask.due_date || ''}
                      onChange={(e) => handleUpdateTaskDetail({ ...selectedTask, due_date: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-250 rounded-xl text-xs focus:outline-none text-gray-700"
                    />
                  </div>

                  <div className="border-t border-gray-150 pt-5">
                    <button
                      onClick={() => handleDeleteTask(selectedTask.id)}
                      className="w-full flex items-center justify-center py-2 px-3 bg-red-50 border border-red-200 hover:bg-red-100 text-gdg-red rounded-xl text-xs font-bold transition-material cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Task
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
