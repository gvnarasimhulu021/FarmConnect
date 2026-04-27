package com.farmconnect.userservice.exception;

public class UserNotFoundException extends RuntimeException {

    public UserNotFoundException(Long id) {
        super("User profile not found with id: " + id);
    }
}
