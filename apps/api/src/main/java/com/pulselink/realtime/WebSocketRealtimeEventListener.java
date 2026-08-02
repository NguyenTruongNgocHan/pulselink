package com.pulselink.realtime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.pulselink.realtime.event.ConversationMessageEvent;
import com.pulselink.realtime.event.GroupRealtimeEvent;
import com.pulselink.realtime.event.UserNotificationEvent;

/**
 * WebSocket infrastructure adapter. It is the only application component that
 * translates committed application events into STOMP broker messages.
 *
 * Delivery failures are logged instead of being propagated after the database
 * transaction has committed. For distributed production deployment this
 * adapter can later be replaced by a transactional-outbox consumer without
 * changing domain services.
 */
@Component
public class WebSocketRealtimeEventListener {

    private static final Logger log = LoggerFactory.getLogger(
            WebSocketRealtimeEventListener.class
    );

    private final SimpMessagingTemplate broker;

    public WebSocketRealtimeEventListener(SimpMessagingTemplate broker) {
        this.broker = broker;
    }

    @EventListener
    public void onConversationEvent(ConversationMessageEvent event) {
        deliver(
                "/topic/conversations/" + event.conversationId(),
                event.payload(),
                "conversation",
                event.conversationId().toString()
        );
    }

    @EventListener
    public void onGroupEvent(GroupRealtimeEvent event) {
        deliver(
                "/topic/groups/" + event.groupId(),
                event.payload(),
                "group",
                event.groupId().toString()
        );
    }

    @EventListener
    public void onNotificationEvent(UserNotificationEvent event) {
        try {
            broker.convertAndSendToUser(
                    event.userId().toString(),
                    "/queue/notifications",
                    event.notification()
            );
        } catch (RuntimeException exception) {
            log.error(
                    "Unable to deliver realtime notification to user {}",
                    event.userId(),
                    exception
            );
        }
    }

    private void deliver(
            String destination,
            Object payload,
            String aggregateType,
            String aggregateId
    ) {
        try {
            broker.convertAndSend(destination, payload);
        } catch (RuntimeException exception) {
            log.error(
                    "Unable to deliver realtime {} event for {}",
                    aggregateType,
                    aggregateId,
                    exception
            );
        }
    }
}
