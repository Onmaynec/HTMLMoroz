import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Send, 
  ChevronLeft,
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatAPI, applicationAPI } from '@/services/api';
import { useSocket } from '@/contexts/SocketContext';
import { toast } from 'sonner';

const AdminChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket, joinApplication, leaveApplication } = useSocket();
  const messagesEndRef = useRef(null);
  
  const [application, setApplication] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApplicationAndMessages();
    
    return () => {
      if (id) leaveApplication(id);
    };
  }, [id]);

  useEffect(() => {
    if (socket) {
      socket.on('new_message', handleNewMessage);
      return () => socket.off('new_message', handleNewMessage);
    }
  }, [socket]);

  const fetchApplicationAndMessages = async () => {
    try {
      const [appRes, messagesRes] = await Promise.all([
        applicationAPI.getById(id),
        chatAPI.getHistory(id)
      ]);

      setApplication(appRes.data.data.application);
      setMessages(messagesRes.data.data.messages || []);
      joinApplication(id);
      scrollToBottom();
    } catch (error) {
      toast.error('Ошибка при загрузке чата');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewMessage = (data) => {
    setMessages(prev => [...prev, data.message]);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await chatAPI.sendMessage(id, newMessage);
      setNewMessage('');
    } catch (error) {
      toast.error('Ошибка при отправке сообщения');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-ice-500/30 border-t-ice-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/applications')}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            Чат с {application?.gameNickname}
          </h1>
          <p className="text-frost-400">{application?.discordUsername}</p>
        </div>
      </div>

      {/* Chat */}
      <Card className="glass-card border-0 flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length > 0 ? (
              messages.map((message, index) => {
                const isAdmin = message.senderRole === 'admin';
                return (
                  <div
                    key={index}
                    className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-[70%] ${isAdmin ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={message.senderId?.avatar} />
                        <AvatarFallback className={isAdmin ? 'bg-ice-500/20 text-ice-400' : 'bg-frost-700 text-frost-300'}>
                          {message.senderName?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`px-4 py-2 rounded-2xl ${
                        isAdmin 
                          ? 'bg-ice-500/20 text-white rounded-tr-sm' 
                          : 'bg-frost-800 text-white rounded-tl-sm'
                      }`}>
                        <p>{message.content}</p>
                        <p className="text-xs text-frost-500 mt-1">
                          {new Date(message.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-frost-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Нет сообщений</p>
                <p className="text-sm">Начните общение первым</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-frost-700/30">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Введите сообщение..."
              className="frost-input flex-1"
            />
            <Button type="submit" className="btn-neon">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AdminChatPage;
