'use client';

import { useState } from 'react';
import StatusBadge from '@/components/StatusBadge';
import { Search, Send, Plus, Paperclip } from 'lucide-react';
import { mockMessages, mockTeamMembers } from '@/app/lib/mock-data';

export default function MessagesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<typeof mockMessages[0] | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newMessageForm, setNewMessageForm] = useState({
    recipient: '',
    subject: '',
    body: '',
    priority: 'normal' as const,
  });

  const filteredMessages = mockMessages.filter((msg) => {
    const matchesSearch =
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.body.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const unreadCount = mockMessages.filter(m => !m.read).length;

  const getMemberRole = (name: string) => {
    const member = mockTeamMembers.find(m => m.name === name);
    return member?.role.replace(/_/g, ' ').toUpperCase() || 'Team Member';
  };

  const getMemberTeam = (name: string) => {
    const member = mockTeamMembers.find(m => m.name === name);
    return member?.team || 'Unknown';
  };

  const handleSendMessage = () => {
    if (newMessageForm.recipient && newMessageForm.subject && newMessageForm.body) {
      alert('Message sent successfully!');
      setNewMessageForm({ recipient: '', subject: '', body: '', priority: 'normal' });
      setShowNewMessageModal(false);
    }
  };

  const handleNewMessageInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewMessageForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
          <p className="text-slate-600 mt-2">Manage team communications and project discussions.</p>
        </div>
        <button 
          onClick={() => setShowNewMessageModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus size={20} />
          New Message
        </button>
      </div>

      {/* Message Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600 font-medium">Total Messages</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{mockMessages.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600 font-medium">Unread</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{unreadCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600 font-medium">Group Messages</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {mockMessages.filter(m => m.isGroupMessage).length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600 font-medium">High Priority</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {mockMessages.filter(m => m.priority === 'high').length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Messages List and Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1 bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 p-4">
            <h2 className="text-lg font-semibold text-slate-900">Inbox</h2>
            <p className="text-sm text-slate-600">{filteredMessages.length} messages</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="p-4 text-center text-slate-500">
                <p>No messages found</p>
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                    selectedMessage?.id === msg.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  } ${!msg.read ? 'bg-slate-50' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${!msg.read ? 'font-bold' : 'font-medium'}`}>
                        {msg.subject}
                      </p>
                      <p className="text-xs text-slate-600 truncate">{msg.from}</p>
                      <p className="text-xs text-slate-500 truncate mt-1">{msg.body.substring(0, 40)}...</p>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      {!msg.read && (
                        <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                      {msg.priority === 'high' && (
                        <span className="inline-block ml-1 px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                          !
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message Detail */}
        {selectedMessage ? (
          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6 flex flex-col">
            {/* Header */}
            <div className="border-b border-slate-200 pb-4 mb-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedMessage.subject}</h2>
                  <p className="text-slate-600 mt-1">
                    {selectedMessage.isGroupMessage ? 'Group Message' : 'Direct Message'}
                  </p>
                </div>
                {selectedMessage.priority === 'high' && (
                  <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                    High Priority
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-xs text-slate-600 font-medium">FROM</p>
                  <p className="font-semibold text-slate-900">{selectedMessage.from}</p>
                  <p className="text-xs text-slate-600">{getMemberRole(selectedMessage.from)} • {getMemberTeam(selectedMessage.from)}</p>
                </div>

                {selectedMessage.isGroupMessage && selectedMessage.participants ? (
                  <div>
                    <p className="text-xs text-slate-600 font-medium">PARTICIPANTS</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedMessage.participants.map((participant) => (
                        <span
                          key={participant}
                          className="inline-block px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs"
                        >
                          {participant}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : selectedMessage.to ? (
                  <div>
                    <p className="text-xs text-slate-600 font-medium">TO</p>
                    <p className="font-semibold text-slate-900">{selectedMessage.to}</p>
                  </div>
                ) : null}

                <div>
                  <p className="text-xs text-slate-600 font-medium">DATE</p>
                  <p className="text-sm text-slate-900">
                    {new Date(selectedMessage.timestamp).toLocaleString('en-GB')}
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 mb-4">
              <p className="text-slate-700 whitespace-pre-wrap">{selectedMessage.body}</p>

              {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-600 font-medium mb-2">ATTACHMENTS</p>
                  <div className="space-y-2">
                    {selectedMessage.attachments.map((attachment, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200"
                      >
                        <Paperclip size={16} className="text-slate-600" />
                        <span className="text-sm text-slate-700">{attachment}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reply Section */}
            <div className="border-t border-slate-200 pt-4">
              <div className="space-y-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply message..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                />
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
                    <Paperclip size={20} />
                    Attach File
                  </button>
                  <button className="ml-auto flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <Send size={18} />
                    Send Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-8 flex items-center justify-center">
            <p className="text-slate-500 text-center">
              Select a message to view details
            </p>
          </div>
        )}
      </div>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">New Message</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Recipient</label>
                <select
                  name="recipient"
                  value={newMessageForm.recipient}
                  onChange={handleNewMessageInputChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select recipient...</option>
                  {mockTeamMembers.map((member) => (
                    <option key={member.id} value={member.name}>{member.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={newMessageForm.subject}
                  onChange={handleNewMessageInputChange}
                  placeholder="Message subject..."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Priority</label>
                <select
                  name="priority"
                  value={newMessageForm.priority}
                  onChange={handleNewMessageInputChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Message</label>
                <textarea
                  name="body"
                  value={newMessageForm.body}
                  onChange={handleNewMessageInputChange}
                  placeholder="Type your message..."
                  rows={5}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleSendMessage}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Send size={18} />
                Send Message
              </button>
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium text-slate-900"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}