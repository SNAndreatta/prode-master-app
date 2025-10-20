import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useNotification, Notification as NotificationType } from '@/context/NotificationContext';

export const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed bottom-4 left-4 z-[9999] space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <Notification key={notification.id} notification={notification} onClose={removeNotification} />
      ))}
    </div>
  );
};

const Notification = ({ 
  notification, 
  onClose 
}: { 
  notification: NotificationType; 
  onClose: (id: string) => void;
}) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-success" />,
    error: <AlertCircle className="w-5 h-5 text-destructive" />,
    info: <Info className="w-5 h-5 text-primary" />,
  };

  const bgColors = {
    success: 'bg-success/10 border-success/30',
    error: 'bg-destructive/10 border-destructive/30',
    info: 'bg-primary/10 border-primary/30',
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm animate-in slide-in-from-left ${bgColors[notification.type]}`}>
      {icons[notification.type]}
      <p className="flex-1 text-sm text-foreground">{notification.message}</p>
      <button
        onClick={() => onClose(notification.id)}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
