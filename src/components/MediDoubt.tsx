import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Send, Bot, User, AlertTriangle } from 'lucide-react';

interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const MediDoubt = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: "Hello! I'm MediDoubt, your medical information assistant. 🏥\n\n⚠️ **IMPORTANT DISCLAIMER**: I provide general medical information only. I cannot prescribe medications, diagnose conditions, or replace professional medical advice. Always consult with a qualified doctor for medical decisions and treatment.",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const mockResponses = {
    fever: "Fever is a common symptom where body temperature rises above normal (98.6°F/37°C). It's usually a sign that your body is fighting an infection.\n\n**Common causes:**\n• Viral or bacterial infections\n• Inflammatory conditions\n• Heat exhaustion\n• Certain medications\n\n**When to see a doctor:**\n• Temperature above 103°F (39.4°C)\n• Fever lasting more than 3 days\n• Difficulty breathing\n• Severe headache or stiff neck\n\n⚠️ **Remember**: This is general information. Please consult a doctor for proper diagnosis and treatment.",
    
    diabetes: "Diabetes is a condition where blood sugar levels are consistently high due to problems with insulin production or usage.\n\n**Types:**\n• Type 1: Body doesn't produce insulin\n• Type 2: Body doesn't use insulin properly\n• Gestational: Develops during pregnancy\n\n**Common symptoms:**\n• Frequent urination\n• Excessive thirst\n• Unexplained weight loss\n• Fatigue\n• Blurred vision\n\n**Management typically includes:**\n• Regular blood sugar monitoring\n• Healthy diet and exercise\n• Medication as prescribed by doctor\n\n⚠️ **Important**: Diabetes requires ongoing medical supervision. Please work with your healthcare provider for proper management.",
    
    hypertension: "High blood pressure (hypertension) occurs when blood pressure consistently measures 140/90 mmHg or higher.\n\n**Risk factors:**\n• Age, family history\n• Obesity, lack of exercise\n• High sodium diet\n• Stress, smoking\n• Certain medical conditions\n\n**Often called 'silent killer' because:**\n• Usually no symptoms\n• Can lead to heart disease, stroke\n• Regular monitoring essential\n\n**Lifestyle modifications:**\n• Reduce sodium intake\n• Regular exercise\n• Maintain healthy weight\n• Limit alcohol\n• Manage stress\n\n⚠️ **Critical**: Blood pressure management requires medical supervision. Never stop prescribed medications without consulting your doctor.",
    
    headache: "Headaches are very common and can have many causes.\n\n**Types:**\n• Tension headaches (most common)\n• Migraines (severe, often one-sided)\n• Cluster headaches (severe, around eye)\n• Sinus headaches (with congestion)\n\n**Common triggers:**\n• Stress, lack of sleep\n• Dehydration\n• Eye strain\n• Certain foods\n• Hormonal changes\n\n**When to seek immediate care:**\n• Sudden, severe headache unlike any before\n• Headache with fever, stiff neck\n• After head injury\n• With vision changes, confusion\n• Progressive worsening\n\n⚠️ **Remember**: While most headaches are benign, sudden severe headaches or pattern changes need medical evaluation."
  };

  const generateResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('fever') || message.includes('temperature')) {
      return mockResponses.fever;
    } else if (message.includes('diabetes') || message.includes('blood sugar')) {
      return mockResponses.diabetes;
    } else if (message.includes('blood pressure') || message.includes('hypertension')) {
      return mockResponses.hypertension;
    } else if (message.includes('headache') || message.includes('head pain')) {
      return mockResponses.headache;
    } else if (message.includes('medicine') || message.includes('medication') || message.includes('prescription')) {
      return "I cannot prescribe medications or recommend specific drugs. Only qualified doctors can prescribe medications after proper examination and diagnosis.\n\n**For medication questions:**\n• Consult your doctor or pharmacist\n• Discuss side effects with healthcare providers\n• Never share medications with others\n• Always complete prescribed courses\n\n⚠️ **Important**: Medication decisions require professional medical oversight.";
    } else if (message.includes('emergency') || message.includes('urgent')) {
      return "🚨 **MEDICAL EMERGENCY**\n\nIf you're experiencing a medical emergency, please:\n• Call emergency services immediately (911 or local emergency number)\n• Go to the nearest emergency room\n• Don't delay seeking professional help\n\n**Emergency signs include:**\n• Chest pain, difficulty breathing\n• Severe bleeding, loss of consciousness\n• Signs of stroke (face drooping, arm weakness, speech difficulty)\n• Severe allergic reactions\n\n⚠️ **This chatbot cannot handle emergencies - seek immediate medical attention!**";
    } else {
      return `I understand you're asking about "${userMessage}". While I'd like to help, I can only provide general medical information.\n\n**For specific medical concerns:**\n• Consult with a qualified healthcare provider\n• Visit a clinic or hospital for examination\n• Call a medical helpline in your area\n\n**I can provide general information about:**\n• Common symptoms (fever, headache, etc.)\n• General health topics\n• When to seek medical care\n\n⚠️ **Remember**: I cannot diagnose, prescribe medications, or replace professional medical advice. Your health is important - please consult with real medical professionals.`;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: generateResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow"
          size="lg"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] z-50 shadow-2xl">
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">MediDoubt</CardTitle>
                <CardDescription className="text-xs">Medical Information Assistant</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              ×
            </Button>
          </div>
          <div className="bg-destructive/10 p-2 rounded text-xs flex items-start space-x-1">
            <AlertTriangle className="w-3 h-3 text-destructive mt-0.5 flex-shrink-0" />
            <span className="text-destructive">No prescriptions provided. Consult real doctors for medical decisions.</span>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {message.sender === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {message.message}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        <Bot className="w-3 h-3" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about symptoms, conditions..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button 
                onClick={handleSendMessage} 
                size="sm"
                disabled={!inputMessage.trim() || isTyping}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MediDoubt;