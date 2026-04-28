package com.farmconnect.cartservice.security;

import com.farmconnect.cartservice.exception.UnauthorizedActionException;
import org.springframework.stereotype.Component;

@Component
public class RequestContextFactory {

    public RequestContext create(String userIdHeader, String roleHeader, String emailHeader) {
        if (roleHeader == null || roleHeader.isBlank()) {
            throw new UnauthorizedActionException("Missing authenticated role");
        }

        Long userId = null;
        if (userIdHeader != null && !userIdHeader.isBlank()) {
            try {
                userId = Long.parseLong(userIdHeader);
            } catch (NumberFormatException ex) {
                throw new UnauthorizedActionException("Invalid authenticated user id");
            }
        }

        return new RequestContext(userId, roleHeader, emailHeader);
    }
}
