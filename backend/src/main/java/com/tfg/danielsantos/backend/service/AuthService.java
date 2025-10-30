package com.tfg.danielsantos.backend.service;

import com.tfg.danielsantos.backend.dto.LoginRequest;
import com.tfg.danielsantos.backend.dto.RegisterRequest;
import com.tfg.danielsantos.backend.exception.AuthenticationException;

import java.util.Map;

/**
 * Servicio para gestionar la autenticación de usuarios
 */
public interface AuthService {
    /**
     * Registra un nuevo usuario en el sistema
     *
     * @param request Datos de registro del usuario
     * @return Información del usuario registrado
     * @throws AuthenticationException Si hay errores en el registro
     */
    Map<String, Object> registerUser(RegisterRequest request) throws AuthenticationException;
    
    /**
     * Autentica al usuario y genera un token de acceso
     *
     * @param request Credenciales del usuario
     * @return Token y datos del usuario autenticado
     * @throws AuthenticationException Si las credenciales son inválidas
     */
    Map<String, Object> loginUser(LoginRequest request) throws AuthenticationException;
    
    /**
     * Elimina una cuenta de usuario
     *
     * @param uid Identificador del usuario a eliminar
     * @return Datos del usuario eliminado
     * @throws AuthenticationException Si hay errores al eliminar la cuenta
     */
    Map<String, Object> deleteUser(String uid) throws AuthenticationException;
}