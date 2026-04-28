package com.farmconnect.orderservice.security;

import com.farmconnect.orderservice.exception.UnauthorizedActionException;
import org.springframework.stereotype.Component;

@Component
public class RequestContextFactory {

    public RequestContext create(String userIdHeader, String roleHeader, String emailHeader) {
        if (roleHeader == null || roleHeader.isBlank()) {
            throw new UnauthorizedActionException("Missing authenticated role");
        }

        Long userId = null;
        if (userIdHeader != null && !userIdHeader.isBlank()) {
            userId = Long.parseLong(userIdHeader);
        }

        return new RequestContext(userId, roleHeader, emailHeader);
    }
}
