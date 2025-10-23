package com.tfg.danielsantos.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
    @NotBlank(message = "El email es requerido")
    @Email(message = "Formato de email inválido")
    private String email;
    
    @NotBlank(message = "La contraseña es requerida")
    @Size(min = 6, max = 128, message = "La contraseña debe tener entre 6 y 128 caracteres")
    private String password;
    
    @Size(max = 50, message = "El nombre de usuario no puede exceder 50 caracteres")
    private String displayName;
    
    // Getters y setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
}