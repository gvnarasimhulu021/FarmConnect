package com.farmconnect.farmerservice.exception;

public class FarmerNotFoundException extends RuntimeException {

    public FarmerNotFoundException(Long id) {
        super("Farmer profile not found with id: " + id);
    }
}
