package com.pulselink.friend.dto;

import java.util.List;

public record FriendRequestsResponse(
        List<FriendRequestResponse> received,
        List<FriendRequestResponse> sent
) { }
