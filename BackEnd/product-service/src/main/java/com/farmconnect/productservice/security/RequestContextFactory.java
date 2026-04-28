package com.farmconnect.productservice.security;

import com.farmconnect.productservice.exception.UnauthorizedActionException;
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
