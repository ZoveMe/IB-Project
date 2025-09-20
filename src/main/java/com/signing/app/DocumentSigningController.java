package com.signing.app;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.security.KeyPair;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow CORS for frontend connection
public class DocumentSigningController {

    private final KeyPair keyPair;

    public DocumentSigningController() throws NoSuchAlgorithmException {
        KeyPairGeneratorUtil keyPairGenUtil = new KeyPairGeneratorUtil();
        this.keyPair = new KeyPair(keyPairGenUtil.getPublicKey(), keyPairGenUtil.getPrivateKey());
    }

    @PostMapping("/sign")
    public ResponseEntity<String> signDocument(@RequestBody String documentContent) {
        try {
            byte[] signature = DigitalSignatureUtil.signData(documentContent.getBytes(), keyPair.getPrivate());
            String signedDataBase64 = Base64.getEncoder().encodeToString(signature);
            return ResponseEntity.ok(signedDataBase64);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error signing document: " + e.getMessage());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<Boolean> verifyDocument(@RequestBody DocumentVerificationRequest request) {
        try {
            byte[] signature = Base64.getDecoder().decode(request.getSignature());
            boolean isValid = DigitalSignatureUtil.verifyData(
                    request.getDocumentContent().getBytes(),
                    signature,
                    keyPair.getPublic()
            );
            return ResponseEntity.ok(isValid);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(false);
        }
    }

    // Inner class for document verification request
    public static class DocumentVerificationRequest {
        private String documentContent;
        private String signature;

        public DocumentVerificationRequest() {}

        public String getDocumentContent() {
            return documentContent;
        }

        public void setDocumentContent(String documentContent) {
            this.documentContent = documentContent;
        }

        public String getSignature() {
            return signature;
        }

        public void setSignature(String signature) {
            this.signature = signature;
        }
    }
}