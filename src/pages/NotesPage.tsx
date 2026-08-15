import React, { useEffect, useState } from 'react';
import { useData, Note } from '@/contexts/DataContext';
import { Send, Inbox, ListTodo, Trash2, Check, Reply, CalendarClock } from 'lucide-react';
import { toast } from 'sonner';

const NotesPage: React.FC = () => {
  const { notes, todos, sendNote, markNoteRead, deleteNote, addTodo, toggleTodo, deleteTodo, currentUserName, isAdmin, selectedDate } = useData();
  const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'todo' | 'new'>('received');
  const [form, setForm] = useState({ to: isAdmin ? 'Abilo' : 'Admin', subject: '', body: '' });
  const [replyTo, setReplyTo] = useState<Note | null>(null);
  const [todoForm, setTodoForm] = useState({ title: '', dueDate: selectedDate, noteId: '' });

  const received = notes.filter(n => n.to.toLowerCase() === currentUserName.toLowerCase());
  const sent = notes.filter(n => n.from.toLowerCase() === currentUserName.toLowerCase());
  const unread = received.filter(n => !n.read).length;

  // Reminder popup for todos due within 2 days
  useEffect(() => {
    todos.filter(t => !t.done).forEach(t => {
      const daysLeft = Math.ceil((new Date(t.dueDate).getTime() - Date.now()) / 86400000);
      if (daysLeft >= 0 && daysLeft <= 2) {
        toast.warning(`Reminder: "${t.title}" — ${daysLeft === 0 ? 'due today' : `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`}`);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.to.trim() || !form.subject.trim()) { toast.error('Add a recipient and subject'); return; }
    sendNote(form.to, form.subject, form.body, replyTo?.id);
    toast.success('Note sent successfully');
    setForm({ to: form.to, subject: '', body: '' });
    setReplyTo(null);
    setActiveTab('sent');
  };

  const submitTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoForm.title.trim()) { toast.error('Add a task title'); return; }
    addTodo(todoForm.title, todoForm.dueDate, todoForm.noteId || undefined);
    toast.success('Added to to-do list');
    setTodoForm({ title: '', dueDate: selectedDate, noteId: '' });
    setActiveTab('todo');
  };

  const addNoteToTodo = (n: Note) => {
    setTodoForm({ title: n.subject, dueDate: selectedDate, noteId: n.id });
    setActiveTab('todo');
  };

  const tabs = [
    { key: 'received' as const, label: `Received${unread ? ` (${unread})` : ''}`, icon: Inbox },
    { key: 'sent' as const, label: 'Sent', icon: Send },
    { key: 'todo' as const, label: 'To-Do List', icon: ListTodo },
    { key: 'new' as const, label: 'New Note', icon: Send },
  ];

  const list = activeTab === 'sent' ? sent : received;

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-heading font-bold">Notes</h2>

      <div className="flex flex-wrap gap-3">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`panel-link ${activeTab === t.key ? 'panel-link-active' : 'panel-link-inactive'}`}>
            <span className="inline-flex items-center gap-2"><t.icon size={14} /> {t.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'new' && (
        <form onSubmit={submitNote} className="form-card space-y-4 animate-fade-in">
          <h3 className="text-sm font-heading font-semibold">{replyTo ? `Reply to ${replyTo.from}` : 'Send a note'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">To</label><input value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" /></div>
            <div><label className="text-sm font-medium">Subject</label><input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" /></div>
          </div>
          <div><label className="text-sm font-medium">Message</label><textarea rows={4} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" /></div>
          <button type="submit" className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90">Send Note</button>
        </form>
      )}

      {activeTab === 'todo' && (
        <div className="space-y-6 animate-fade-in">
          <form onSubmit={submitTodo} className="form-card space-y-4">
            <h3 className="text-sm font-heading font-semibold">Add to-do</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium">Task</label><input value={todoForm.title} onChange={e => setTodoForm({ ...todoForm, title: e.target.value })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" /></div>
              <div><label className="text-sm font-medium">Remind me by</label><input type="date" value={todoForm.dueDate} onChange={e => setTodoForm({ ...todoForm, dueDate: e.target.value })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" /></div>
            </div>
            <button type="submit" className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90">Add Task</button>
          </form>

          <div className="space-y-3">
            {todos.map(t => {
              const daysLeft = Math.ceil((new Date(t.dueDate).getTime() - Date.now()) / 86400000);
              return (
                <div key={t.id} className="panel-card p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleTodo(t.id)} aria-label="Toggle task"
                      className={`w-5 h-5 rounded border flex items-center justify-center ${t.done ? 'bg-primary border-primary text-primary-foreground' : 'border-border'}`}>
                      {t.done && <Check size={12} />}
                    </button>
                    <div>
                      <p className={`text-sm font-medium ${t.done ? 'line-through text-muted-foreground' : ''}`}>{t.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><CalendarClock size={12} /> {t.dueDate} · {daysLeft < 0 ? 'overdue' : daysLeft === 0 ? 'due today' : `${daysLeft} days left`}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteTodo(t.id)} aria-label="Delete task" className="p-1.5 rounded hover:bg-secondary text-destructive"><Trash2 size={14} /></button>
                </div>
              );
            })}
            {todos.length === 0 && <div className="panel-card p-8 text-center text-muted-foreground text-sm">No tasks yet</div>}
          </div>
        </div>
      )}

      {(activeTab === 'received' || activeTab === 'sent') && (
        <div className="space-y-3">
          {list.map(n => (
            <div key={n.id} className={`panel-card p-4 space-y-2 ${!n.read && activeTab === 'received' ? 'border-l-4 border-l-primary' : ''}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{n.subject}</p>
                  <p className="text-xs text-muted-foreground">{activeTab === 'sent' ? `To ${n.to}` : `From ${n.from}`} · {n.date} {n.replyToId ? '· reply' : ''}</p>
                </div>
                <div className="flex gap-1">
                  {activeTab === 'received' && !n.read && (
                    <button onClick={() => { markNoteRead(n.id); toast.success('Marked as read'); }} className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium">Mark as read</button>
                  )}
                  {activeTab === 'received' && (
                    <>
                      <button onClick={() => { setReplyTo(n); setForm({ to: n.from, subject: `Re: ${n.subject}`, body: '' }); setActiveTab('new'); }} aria-label="Reply" className="p-1.5 rounded hover:bg-secondary text-info"><Reply size={14} /></button>
                      <button onClick={() => addNoteToTodo(n)} className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium">Add to to-do</button>
                    </>
                  )}
                  <button onClick={() => { deleteNote(n.id); toast.success('Note deleted'); }} aria-label="Delete note" className="p-1.5 rounded hover:bg-secondary text-destructive"><Trash2 size={14} /></button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{n.body}</p>
            </div>
          ))}
          {list.length === 0 && <div className="panel-card p-8 text-center text-muted-foreground text-sm">No notes</div>}
        </div>
      )}
    </div>
  );
};

export default NotesPage;
