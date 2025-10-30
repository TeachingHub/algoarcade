package com.tfg.danielsantos.backend.service;

import com.tfg.danielsantos.backend.exception.ResourceNotFoundException;

import java.util.Map;

/**
 * Servicio para gestionar perfiles de usuario
 */
public interface UserProfileService {
    /**
     * Obtiene el perfil completo de un usuario
     *
     * @param uid Identificador del usuario
     * @return Datos del perfil del usuario
     * @throws ResourceNotFoundException Si el usuario no existe
     */
    Map<String, Object> getUserProfile(String uid) throws ResourceNotFoundException;
    
    /**
     * Actualiza el perfil de un usuario
     *
     * @param uid Identificador del usuario
     * @param profileData Datos del perfil a actualizar
     * @return Datos actualizados del perfil
     * @throws ResourceNotFoundException Si el usuario no existe
     */
    Map<String, Object> updateUserProfile(String uid, Map<String, Object> profileData) 
            throws ResourceNotFoundException;
}