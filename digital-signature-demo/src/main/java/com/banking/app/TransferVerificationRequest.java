package com.banking.app;

public class TransferVerificationRequest {
    private TransferRequest transferRequest;
    private String signature;

    public TransferRequest getTransferRequest() {
        return transferRequest;
    }

    public void setTransferRequest(TransferRequest transferRequest) {
        this.transferRequest = transferRequest;
    }

    public String getSignature() {
        return signature;
    }

    public void setSignature(String signature) {
        this.signature = signature;
    }
}
