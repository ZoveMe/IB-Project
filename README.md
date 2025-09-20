# Fund Transfer API with Digital Signatures in Spring Boot

## Description

This project demonstrates a secure fund transfer API implemented using Spring Boot, leveraging digital signatures to ensure the authenticity and integrity of transactions. Digital signatures provide a robust mechanism to verify that the data has not been altered and is indeed from a verified source, adding an extra layer of security to financial transactions.

## Features

- **Secure Fund Transfer:** Ensures transactions are authenticated and untampered using digital signatures.
- **RESTful API:** Provides endpoints to sign and verify fund transfer requests.
- **Cryptographic Security:** Utilizes RSA algorithm for key generation, signing, and verification.

## Prerequisites

- Java 8 or higher
- Maven
- An IDE such as IntelliJ IDEA or Eclipse

## Setup Instructions

1. **Clone the Repository:**

   ```sh
   git clone https://github.com/eidankhan/digital-signature-demo.git
   cd digital-signature-demo

2. **Open the Project in Your IDE:**
   Import the project as a Maven project.
  
3. **Build the Project:**
    ```sh
    mvn clean install

4. **Run the Application**
   ```sh
   mvn spring-boot:run
