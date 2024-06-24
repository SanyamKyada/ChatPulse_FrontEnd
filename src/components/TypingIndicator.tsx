import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { getHubConnection } from "../services/signalR/SignalRService";
import { RECEIVE_TYPING_NOTIFICATION } from "../services/signalR/constants";

interface TypingIndicatorProps {
  contactId: string;
  toggleScroll: () => void;
}

const TypingIndicator = forwardRef<
  { hideTypingIndicator: React.Dispatch<React.SetStateAction<boolean>> },
  TypingIndicatorProps
>(({ contactId, toggleScroll }, ref) => {
  const [isContactTyping, setIsContactTyping] = useState<boolean>(false);
  const [timeoutId, setTimeoutId] = useState<number | undefined>(undefined);

  useImperativeHandle(ref, () => ({
    hideTypingIndicator() {
      setIsContactTyping(false);
    },
  }));

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  useEffect(() => {
    const reciveNotificationHandler = (userId: string): void => {
      if (userId == contactId) {
        setIsContactTyping(true);

        if (timeoutId) {
          clearTimeout(timeoutId);
        } else {
          toggleScroll();
        }
        const newTimeoutId = setTimeout(() => {
          setIsContactTyping(false);
          setTimeoutId(undefined);
        }, 2000) as unknown as number;
        setTimeoutId(newTimeoutId);
      }
    };

    let hubConnection;

    const initializeHandlers = async () => {
      hubConnection = await getHubConnection();
      hubConnection.on(RECEIVE_TYPING_NOTIFICATION, reciveNotificationHandler);
    };
    initializeHandlers();

    return () => {
      hubConnection.off(RECEIVE_TYPING_NOTIFICATION, reciveNotificationHandler);
    };
  }, [contactId, timeoutId]);

  return (
    isContactTyping && (
      <ul className="conversation-wrapper">
        <li className="conversation-item conversation-item-left">
          <div className="conversation-item-side">
            <img
              className="conversation-item-image"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cGVvcGxlfGVufDB8fDB8fHww&amp;auto=format&amp;fit=crop&amp;w=500&amp;q=60"
              alt=""
            />
          </div>
          <div className="chat-bubble">
            <div className="typing">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        </li>
      </ul>
    )
  );
});

export default TypingIndicator;
