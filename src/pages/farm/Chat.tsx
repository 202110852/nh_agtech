import { Megaphone, MessageCircle, Send } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { Header } from '../../components/layout/Header'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { farmNavItems } from '../../config/farmNav'
import type { Announcement, AnnouncementType, ChatThread } from '../../data/mockData'
import { announcements as initialAnnouncements, chatThreads as initialChatThreads } from '../../data/mockData'

type ChatTab = 'announcements' | 'direct'

const announcementTypeLabels: Record<AnnouncementType, string> = {
  delay: '배송 지연',
  general: '일반 공지',
}

const announcementTypeVariants: Record<AnnouncementType, 'primary' | 'accent'> = {
  delay: 'accent',
  general: 'primary',
}

export function FarmChat() {
  const [tab, setTab] = useState<ChatTab>('direct')
  const [announcements, setAnnouncements] = useState(initialAnnouncements)
  const [threads, setThreads] = useState(initialChatThreads)
  const [selectedThreadId, setSelectedThreadId] = useState(initialChatThreads[0].id)
  const [draft, setDraft] = useState('')
  const [showCompose, setShowCompose] = useState(false)
  const [announcementTitle, setAnnouncementTitle] = useState('')
  const [announcementContent, setAnnouncementContent] = useState('')
  const [announcementType, setAnnouncementType] = useState<AnnouncementType>('delay')

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId) ?? threads[0],
    [threads, selectedThreadId],
  )

  const unreadCount = threads.reduce((sum, thread) => sum + thread.unread, 0)

  const handleSendMessage = () => {
    const content = draft.trim()
    if (!content || !selectedThread) return

    const timestamp = '방금'
    const newMessage = {
      id: `m-${Date.now()}`,
      sender: 'farm' as const,
      content,
      timestamp,
    }

    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === selectedThread.id
          ? {
              ...thread,
              unread: 0,
              lastMessage: content,
              lastMessageAt: timestamp,
              messages: [...thread.messages, newMessage],
            }
          : thread,
      ),
    )
    setDraft('')
  }

  const handlePublishAnnouncement = () => {
    const title = announcementTitle.trim()
    const content = announcementContent.trim()
    if (!title || !content) return

    const announcement: Announcement = {
      id: `a-${Date.now()}`,
      title,
      content,
      type: announcementType,
      createdAt: '방금',
      recipientCount: 28,
    }

    setAnnouncements((prev) => [announcement, ...prev])
    setAnnouncementTitle('')
    setAnnouncementContent('')
    setAnnouncementType('delay')
    setShowCompose(false)
  }

  const openThread = (thread: ChatThread) => {
    setSelectedThreadId(thread.id)
    setThreads((prev) =>
      prev.map((item) => (item.id === thread.id ? { ...item, unread: 0 } : item)),
    )
  }

  return (
    <AppShell navItems={farmNavItems} roleLabel="농가 관리">
      <Header
        title="채팅"
        subtitle={tab === 'direct' ? `1:1 대화 ${threads.length}건 · 미읽음 ${unreadCount}` : `공지 ${announcements.length}건`}
      />
      <div className="px-4 py-4 md:px-6 max-w-5xl mx-auto w-full min-w-0 overflow-x-hidden">
        <div className="flex gap-2 mb-4 min-w-0">
          <button
            onClick={() => setTab('direct')}
            className={`flex flex-1 min-w-0 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors sm:gap-2 sm:px-4 ${
              tab === 'direct'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-primary'
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            1:1 채팅
            {unreadCount > 0 && (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{unreadCount}</span>
            )}
          </button>
          <button
            onClick={() => setTab('announcements')}
            className={`flex flex-1 min-w-0 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors sm:gap-2 sm:px-4 ${
              tab === 'announcements'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-primary'
            }`}
          >
            <Megaphone className="h-4 w-4" />
            공지
          </button>
        </div>

        {tab === 'announcements' ? (
          <div className="space-y-4">
            <Button fullWidth variant="outline" onClick={() => setShowCompose((prev) => !prev)}>
              {showCompose ? '작성 취소' : '새 공지 작성'}
            </Button>

            {showCompose && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-3">공지 작성</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted">공지 유형</label>
                    <select
                      value={announcementType}
                      onChange={(e) => setAnnouncementType(e.target.value as AnnouncementType)}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="delay">배송 지연</option>
                      <option value="general">일반 공지</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted">제목</label>
                    <input
                      type="text"
                      value={announcementTitle}
                      onChange={(e) => setAnnouncementTitle(e.target.value)}
                      placeholder="예: 배송 지연 안내"
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted">내용</label>
                    <textarea
                      value={announcementContent}
                      onChange={(e) => setAnnouncementContent(e.target.value)}
                      placeholder="고객에게 전달할 공지 내용을 입력하세요"
                      rows={4}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm resize-none focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <Button fullWidth onClick={handlePublishAnnouncement}>
                    전체 고객에게 발송
                  </Button>
                </div>
              </Card>
            )}

            <div className="space-y-3">
              {announcements.map((announcement) => (
                <Card key={announcement.id}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <Badge variant={announcementTypeVariants[announcement.type]}>
                      {announcementTypeLabels[announcement.type]}
                    </Badge>
                    <span className="text-xs text-muted shrink-0">{announcement.createdAt}</span>
                  </div>
                  <h4 className="break-words font-semibold text-gray-900">{announcement.title}</h4>
                  <p className="mt-2 break-words text-sm text-gray-700 leading-relaxed">{announcement.content}</p>
                  <p className="mt-3 text-xs text-muted">{announcement.recipientCount}명에게 발송됨</p>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid min-w-0 gap-4 lg:grid-cols-5">
            <div className="min-w-0 space-y-2 lg:col-span-2">
              {threads.map((thread) => (
                <Card
                  key={thread.id}
                  onClick={() => openThread(thread)}
                  className={selectedThread?.id === thread.id ? 'ring-2 ring-inset ring-primary' : ''}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary font-bold text-sm shrink-0">
                      {thread.customerName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex min-w-0 items-center justify-between gap-2">
                        <p className="min-w-0 truncate font-semibold text-gray-900">{thread.customerName}</p>
                        <span className="max-w-[45%] truncate text-[10px] text-muted shrink-0">{thread.lastMessageAt}</span>
                      </div>
                      <p className="text-xs text-muted truncate">{thread.lastMessage}</p>
                    </div>
                    {thread.unread > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white shrink-0">
                        {thread.unread}
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <div className="min-w-0 lg:col-span-3">
              <Card className="flex min-w-0 flex-col min-h-[420px] overflow-hidden">
                <div className="border-b border-gray-100 pb-3 mb-3">
                  <h3 className="font-bold text-gray-900">{selectedThread.customerName}</h3>
                  <p className="text-xs text-muted">1:1 상담</p>
                </div>

                <div className="mb-4 max-h-80 min-w-0 flex-1 space-y-3 overflow-y-auto overflow-x-hidden">
                  {selectedThread.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex min-w-0 ${message.sender === 'farm' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] min-w-0 break-words rounded-2xl px-4 py-2.5 text-sm ${
                          message.sender === 'farm'
                            ? 'bg-primary text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-900 rounded-bl-md'
                        }`}
                      >
                        <p className="break-words">{message.content}</p>
                        <p
                          className={`mt-1 text-[10px] ${
                            message.sender === 'farm' ? 'text-white/70' : 'text-muted'
                          }`}
                        >
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex min-w-0 gap-2">
                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="메시지를 입력하세요"
                    className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <Button className="shrink-0" onClick={handleSendMessage} disabled={!draft.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
