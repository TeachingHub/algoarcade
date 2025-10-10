package com.tfg.danielsantos.backend.security;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Component
public class FirebaseAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private FirebaseAuth firebaseAuth;

    /**
     * Lista de rutas que NO necesitan autenticación con Firebase
     * 
     * Estas rutas son públicas y el filtro NO las procesará.
     * El filtro se "salta" estas rutas gracias al método shouldNotFilter()
     * 
     * IMPORTANTE: Actualizar esta lista si cambias el versionado de la API
     */
    private static final List<String> EXCLUDED_PATHS = Arrays.asList(
        "/api/v1/public",   // Endpoints públicos (versionados)
        "/api/v1/auth",     // Endpoints de autenticación (versionados)
        "/api/v1/health",   // Health check versionado
        "/api/v1/info",     // Info endpoint versionado
        "/test-auth.html",  // Página de testing de autenticación
        "/static",          // Recursos estáticos (CSS, JS, imágenes)
        "/css",             // Archivos CSS
        "/js",              // Archivos JavaScript
        "/images",          // Imágenes
        "/",                // Raíz
        "/index.html",      // Página principal
        "/health",          // Health check (sin versión)
        "/actuator"         // Actuator endpoints (sin versión)
    );

    /**
     * Este método decide si el filtro debe ejecutarse o no para una petición específica.
     * Si retorna true, el filtro NO se ejecuta (la petición pasa directamente).
     * Si retorna false, el filtro SÍ se ejecuta (valida el token).
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        // Verifica si la ruta comienza con alguna de las rutas excluidas
        return EXCLUDED_PATHS.stream().anyMatch(path::startsWith);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        String authorizationHeader = request.getHeader("Authorization");
        
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);
            
            try {
                FirebaseToken decodedToken = firebaseAuth.verifyIdToken(token);
                String uid = decodedToken.getUid();
                
                // Crear autenticación con los datos del usuario
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(
                        uid, 
                        null, 
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                    );
                
                // Agregar información adicional del token
                authentication.setDetails(decodedToken);
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
            } catch (FirebaseAuthException e) {
                logger.error("Error validating Firebase token: " + e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        }
        
        filterChain.doFilter(request, response);
    }
}