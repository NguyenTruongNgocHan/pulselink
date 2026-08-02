package com.pulselink.realtime;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import com.pulselink.auth.domain.User;
import com.pulselink.auth.domain.UserRepository;
import com.pulselink.auth.security.JwtService;
import com.pulselink.conversation.service.ConversationAccessService;
import com.pulselink.presence.service.PresenceService;

@Component
public class WebSocketAuthorizationInterceptor implements ChannelInterceptor {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final Pattern CONVERSATION_TOPIC = Pattern.compile(
            "^/topic/(?:conversations|groups)/([a-fA-F0-9-]{36})$"
    );

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final ConversationAccessService conversationAccessService;
    private final PresenceService presenceService;

    public WebSocketAuthorizationInterceptor(
            JwtService jwtService,
            UserRepository userRepository,
            ConversationAccessService conversationAccessService,
            PresenceService presenceService
    ) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.conversationAccessService = conversationAccessService;
        this.presenceService = presenceService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(
                message,
                StompHeaderAccessor.class
        );
        if (accessor == null) {
            return message;
        }
        StompCommand command = accessor.getCommand();
        if (command == null) {
            return message;
        }
        if (command == StompCommand.CONNECT) {
            authenticate(accessor);
        } else if (command == StompCommand.SUBSCRIBE) {
            authorizeSubscription(accessor);
        } else if (command == StompCommand.SEND) {
            currentUserId(accessor).ifPresent(userId ->
                    presenceService.heartbeat(userId, accessor.getSessionId())
            );
        } else if (command == StompCommand.DISCONNECT) {
            currentUserId(accessor).ifPresent(userId ->
                    presenceService.disconnect(userId, accessor.getSessionId())
            );
        }
        return message;
    }

    private void authenticate(StompHeaderAccessor accessor) {
        String header = accessor.getFirstNativeHeader("Authorization");
        if (header == null || !header.startsWith(BEARER_PREFIX)) {
            throw new IllegalArgumentException("Missing WebSocket authorization token");
        }
        JwtService.AccessTokenClaims claims = jwtService.parse(header.substring(BEARER_PREFIX.length()))
                .orElseThrow(() -> new IllegalArgumentException("Invalid WebSocket authorization token"));
        User user = userRepository.findById(claims.userId())
                .filter(candidate -> valid(candidate, claims))
                .orElseThrow(() -> new IllegalArgumentException("WebSocket account is unavailable"));
        accessor.setUser(new UsernamePasswordAuthenticationToken(
                user.getId(),
                null,
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        ));
        presenceService.register(user.getId(), accessor.getSessionId());
    }

    private void authorizeSubscription(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        if (destination == null) {
            throw new IllegalArgumentException("Subscription destination is required");
        }
        UUID userId = currentUserId(accessor)
                .orElseThrow(() -> new IllegalArgumentException(
                        "WebSocket authentication is required"
                ));
        if ("/user/queue/notifications".equals(destination)) {
            presenceService.heartbeat(userId, accessor.getSessionId());
            return;
        }

        Matcher matcher = CONVERSATION_TOPIC.matcher(destination);
        if (!matcher.matches()) {
            throw new IllegalArgumentException("Subscription destination is not allowed");
        }
        UUID conversationId = UUID.fromString(matcher.group(1));
        if (!conversationAccessService.isMember(conversationId, userId)) {
            throw new IllegalArgumentException("Conversation subscription is not allowed");
        }
        presenceService.heartbeat(userId, accessor.getSessionId());
    }

    private java.util.Optional<UUID> currentUserId(StompHeaderAccessor accessor) {
        if (accessor.getUser() instanceof UsernamePasswordAuthenticationToken authentication
                && authentication.getPrincipal() instanceof UUID userId) {
            return java.util.Optional.of(userId);
        }
        return java.util.Optional.empty();
    }

    private boolean valid(User user, JwtService.AccessTokenClaims claims) {
        if (user.getTokenVersion() != claims.tokenVersion()
                || !user.getRole().name().equals(claims.role())) {
            return false;
        }
        if (user.getStatus() == User.Status.ACTIVE) {
            return true;
        }
        return user.getStatus() == User.Status.SUSPENDED
                && user.getSuspendedUntil() != null
                && user.getSuspendedUntil().isBefore(Instant.now());
    }
}
