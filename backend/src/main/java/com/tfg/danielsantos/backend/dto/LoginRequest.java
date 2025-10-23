package com.tfg.danielsantos.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
    @NotBlank(message = "El email es requerido")
    @Email(message = "Formato de email inválido")
    private String email;
    
    @NotBlank(message = "La contraseña es requerida")
    private String password;
    
    // Getters y setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}