package com.banking.app;

import org.springframework.web.bind.annotation.*;

import java.security.KeyPair;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

@RestController
@RequestMapping("/api")
public class FundTransferController {

    private final KeyPair keyPair;

    public FundTransferController() throws NoSuchAlgorithmException {
        KeyPairGeneratorUtil keyPairGenUtil = new KeyPairGeneratorUtil();
        this.keyPair = new KeyPair(keyPairGenUtil.getPublicKey(), keyPairGenUtil.getPrivateKey());
    }

    @PostMapping("/sign-transfer")
    public String signTransfer(@RequestBody TransferRequest request) throws Exception {
        String data = request.toString();
        byte[] signature = DigitalSignatureUtil.signData(data.getBytes(), keyPair.getPrivate());
        return Base64.getEncoder().encodeToString(signature);
    }

    @PostMapping("/verify-transfer")
    public boolean verifyTransfer(@RequestBody TransferVerificationRequest request) throws Exception {
        byte[] signature = Base64.getDecoder().decode(request.getSignature());
        return DigitalSignatureUtil.verifyData(request.getTransferRequest().toString().getBytes(), signature, keyPair.getPublic());
    }
}